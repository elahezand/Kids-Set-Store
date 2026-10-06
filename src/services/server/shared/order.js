const { Types } = require("mongoose");
const Order = require("@/model/order");
const Product = require("@/model/product");
const Coupon = require("@/model/coupon");
const { refundToWallet } = require("@/services/server/shared/wallet");
const { escapeRegex } = require("@/utils/helper");
const AppError = require("@/utils/AppError");
const logger = require("@/utils/logger");
const { round2 } = require("@/utils/pricing");
const { notifyUser, NOTIFY_LINKS } = require("@/utils/notify");

const claimItem = (orderId, itemId, from) =>
    Order.updateOne(
        { _id: orderId, items: { $elemMatch: { _id: itemId, stockReserved: from ? true : { $ne: true } } } },
        { $set: { "items.$.stockReserved": !from } }
    );

/* Put back the stock of every reserved item (each item claimed, so it's never given back twice) */
const releaseStock = async (order) => {
    for (const item of order.items) {
        if (!item.stockReserved) continue;

        const released = await claimItem(order._id, item._id, true);
        item.stockReserved = false;
        if (!released.modifiedCount) continue;

        if (item.variantId) {
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { "metrics.sold": -item.quantity, "variants.$[elem].stock": item.quantity } },
                { arrayFilters: [{ "elem._id": new Types.ObjectId(item.variantId) }] }
            );
        } else {
            await Product.updateOne({ _id: item.productId }, { $inc: { "metrics.sold": -item.quantity } });
        }
    }
};

/*
 * Take the stock at checkout, before the buyer goes to the payment gateway, so two buyers can't pay
 * for the last item. All or nothing: if one item doesn't fit, everything taken so far goes back.
 * Returns the item that ran out, or null when everything was reserved.
 */
const reserveStock = async (order) => {
    for (const item of order.items) {
        if (item.stockReserved) continue;

        const claim = await claimItem(order._id, item._id, false);
        if (!claim.modifiedCount) continue;
        item.stockReserved = true;

        if (!item.variantId) {
            await Product.updateOne({ _id: item.productId }, { $inc: { "metrics.sold": item.quantity } });
            continue;
        }

        const taken = await Product.updateOne(
            {
                _id: item.productId,
                variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } },
            },
            { $inc: { "metrics.sold": item.quantity, "variants.$[elem].stock": -item.quantity } },
            { arrayFilters: [{ "elem._id": new Types.ObjectId(item.variantId) }] }
        );

        if (!taken.modifiedCount) {
            // this one ran out: undo its claim (nothing was taken for it), then give back the rest
            await claimItem(order._id, item._id, true);
            item.stockReserved = false;
            await releaseStock(order);
            return item;
        }
    }
    return null;
};

const finalizeOrder = async (order) => {
    if (order.coupon?.couponId && !order.couponCounted) {
        const claim = await Order.updateOne(
            { _id: order._id, couponCounted: { $ne: true } },
            { $set: { couponCounted: true } }
        );
        if (claim.modifiedCount) {
            await Coupon.updateOne({ _id: order.coupon.couponId }, { $inc: { usedCount: 1 } });
        }
        order.couponCounted = true;
    }

    for (const item of order.items) {
        if (item.stockReserved) continue;

        const claim = await claimItem(order._id, item._id, false);
        item.stockReserved = true;
        if (!claim.modifiedCount) continue; // another run already reserved this item

        if (item.variantId) {
            const result = await Product.updateOne(
                {
                    _id: item.productId,
                    variants: { $elemMatch: { _id: item.variantId, stock: { $gte: item.quantity } } },
                },
                {
                    $inc: {
                        "metrics.sold": item.quantity,
                        "variants.$[elem].stock": -item.quantity,
                    },
                },
                { arrayFilters: [{ "elem._id": new Types.ObjectId(item.variantId) }] }
            );

            if (result.modifiedCount === 0) {
                logger.error(
                    `[order ${order._id}] stock update FAILED for product ${item.productId}, variantId: ${item.variantId}, qty: ${item.quantity} - needs manual review/refund.`
                );
            }
        } else {
            // products without variants have no stock to take, but still count as sold
            await Product.updateOne({ _id: item.productId }, { $inc: { "metrics.sold": item.quantity } });
        }
    }

    // a stuck order that was already shipped/completed must not move back
    if (order.status === "created") order.status = "processing";
    await order.save();
};

const revertOrder = async (order) => {
    if (order.revertedAt) return;

    const claim = await Order.updateOne({ _id: order._id, revertedAt: null }, { $set: { revertedAt: new Date() } });
    if (!claim.modifiedCount) return; // already reverted by another run
    order.revertedAt = new Date();

    await releaseStock(order);

    if (order.coupon?.couponId && order.couponCounted) {
        const released = await Order.updateOne(
            { _id: order._id, couponCounted: true },
            { $set: { couponCounted: false } }
        );
        if (released.modifiedCount) {
            await Coupon.updateOne({ _id: order.coupon.couponId }, { $inc: { usedCount: -1 } });
        }
        order.couponCounted = false;
    }

    // give the money back to the buyer's wallet: what the gateway took + what the wallet paid
    const walletUsed = order.pricing.walletUsed || 0;
    const gatewayPaid = order.paymentStatus === "paid" ? order.pricing.total : 0;
    const refund = round2(gatewayPaid + walletUsed);

    if (refund > 0) {
        const given = await refundToWallet(order.user, order._id, refund, "order cancelled");
        if (given > 0) {
            // paid orders (gateway or fully from the wallet) become "refunded"; unpaid cash stays "pending"
            if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
            order.refundedAt = new Date();
            order.refundAmount = given;
        }
    }

    // nothing was charged: the payment of a cancelled order can't happen any more -> "failed" (model enum)
    if (order.paymentStatus === "pending") order.paymentStatus = "failed";

    await order.save();

    // one message with the refund (the callers skip the plain "status changed to cancelled" one)
    const shortId = String(order._id).slice(-6).toUpperCase();
    const amount = Number(order.refundAmount || 0);
    await notifyUser(
        order.user,
        amount > 0
            ? `Your order #${shortId} was cancelled. ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} $ was refunded to your wallet.`
            : `Your order #${shortId} was cancelled.`,
        { type: "order_status", link: NOTIFY_LINKS.userOrders }
    );
};

const DAY_MS = 24 * 60 * 60 * 1000;
const AUTO_COMPLETE_DAYS = Number(process.env.ORDER_AUTO_COMPLETE_DAYS || 7);
const AFTER_ETA_DAYS = Number(process.env.ORDER_AUTO_COMPLETE_AFTER_ETA_DAYS || 3);

/**
 * completes a shipped order. For cash orders this also marks them paid, so it is only called when the
 * money is confirmed: by an admin ("Cash received") — never by the customer's own confirmation.
 */
const completeDeliveredOrder = async (order, { auto = false } = {}) => {
    order.status = "completed";
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || new Date();
    if (auto) order.autoCompletedAt = new Date();
    if (order.paymentMethod === "cash") order.paymentStatus = "paid";
    await order.save();
};

/* "should have arrived + grace days" is over — the same date for online auto-complete and cash overdue */
const pastDueQuery = (now = Date.now()) => ({
    $or: [
        { expectedDeliveryAt: { $ne: null, $lte: new Date(now - AFTER_ETA_DAYS * DAY_MS) } },
        { expectedDeliveryAt: null, shippedAt: { $ne: null, $lte: new Date(now - AUTO_COMPLETE_DAYS * DAY_MS) } },
    ],
});

const pastDueAt = (order) => {
    if (order.expectedDeliveryAt) return new Date(new Date(order.expectedDeliveryAt).getTime() + AFTER_ETA_DAYS * DAY_MS);
    if (order.shippedAt) return new Date(new Date(order.shippedAt).getTime() + AUTO_COMPLETE_DAYS * DAY_MS);
    return null;
};

const isPastDue = (order, now = Date.now()) => {
    const due = pastDueAt(order);
    return Boolean(due && due.getTime() <= now);
};

const autoCompleteShippedOrders = async () => {
    const orders = await Order.find({
        status: "shipped",
        paymentStatus: "paid",
        autoCompletedAt: null,
        ...pastDueQuery(),
    }).limit(200);

    let completed = 0;

    for (const order of orders) {
        try {
            // claim first, so two overlapping runs don't both complete (and notify) the same order
            const claim = await Order.updateOne(
                { _id: order._id, status: "shipped", autoCompletedAt: null },
                { $set: { autoCompletedAt: new Date() } }
            );
            if (!claim.modifiedCount) continue;

            await completeDeliveredOrder(order, { auto: true });
            completed++;
            logger.info(`[order ${order._id}] auto-completed (buyer did not confirm delivery)`);
        } catch (err) {
            logger.error(`[order ${order._id}] auto-complete failed: ${err?.message || err}`);
        }
    }

    return completed;
};

const markOrderShipped = (order, trackingCode, estimatedDeliveryAt = null) => {
    order.trackingCode = trackingCode;
    order.shippedAt = new Date();
    order.expectedDeliveryAt = estimatedDeliveryAt || null;
    order.status = "shipped";
};

const setOrderDeliveryEstimate = (order, estimatedDeliveryAt) => {
    if (order.status !== "shipped") {
        throw new AppError(400, "Only a shipped order can get a new delivery time");
    }
    order.expectedDeliveryAt = estimatedDeliveryAt;
};

const buildOrderIdSearchExpr = (q) => {
    if (!q || !String(q).trim()) return null;
    return {
        $regexMatch: {
            input: { $toString: "$_id" },
            regex: escapeRegex(String(q).trim()),
            options: "i",
        },
    };
};

module.exports = {
    pastDueQuery,
    pastDueAt,
    isPastDue,
    completeDeliveredOrder,
    autoCompleteShippedOrders,
    revertOrder,
    buildOrderIdSearchExpr,
    finalizeOrder,
    reserveStock,
    releaseStock,
    markOrderShipped,
    setOrderDeliveryEstimate,
};
