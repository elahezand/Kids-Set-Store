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

const finalizeOrder = async (order) => {
    if (order.coupon?.couponId && !order.couponCounted) {
        await Coupon.updateOne({ _id: order.coupon.couponId }, { $inc: { usedCount: 1 } });
        order.couponCounted = true;
        await order.save();
    }
    for (const item of order.items) {
        if (!item.stockReserved) {
            let result = null;

            if (item.variantId) {
                result = await Product.updateOne(
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
            }

            if (result && result.modifiedCount === 0) {
                logger.error(
                    `[order ${order._id}] stock update FAILED for product ${item.productId} , variantId: ${item.variantId || "none"}, qty: ${item.quantity}) - needs manual review/refund.`
                );
            }

            item.stockReserved = true;
            await order.save();
        }

    }
    order.status = "processing";
};

const revertOrder = async (order) => {
    if (order.revertedAt) return;
    for (const item of order.items) {
        if (item.stockReserved && item.variantId) {
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { "metrics.sold": -item.quantity, "variants.$[elem].stock": item.quantity } },
                { arrayFilters: [{ "elem._id": new Types.ObjectId(item.variantId) }] }
            );

            item.stockReserved = false;
        }
        await order.save();
    }

    if (order.coupon?.couponId && order.couponCounted) {
        await Coupon.updateOne({ _id: order.coupon.couponId }, { $inc: { usedCount: -1 } });
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

    order.revertedAt = new Date();
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

    for (const order of orders) {
        await completeDeliveredOrder(order, { auto: true });
        logger.info(`[order ${order._id}] auto-completed (buyer did not confirm delivery)`);
    }

    return orders.length;
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

module.exports = {
    pastDueQuery,
    pastDueAt,
    isPastDue,
    completeDeliveredOrder,
    autoCompleteShippedOrders,
    revertOrder,
    buildOrderIdSearchExpr,
    finalizeOrder,
    markOrderShipped,
    setOrderDeliveryEstimate,
};
