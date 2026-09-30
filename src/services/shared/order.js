const { Types } = require("mongoose");
const Order = require("@/model/order");
const Product = require("@/model/product");
const Coupon = require("@/model/coupon");
const { refundToWallet } = require("@/services/shared/wallet");
const { escapeRegex } = require("@/utils/helper");
const AppError = require("@/utils/AppError");
const logger = require("@/utils/logger");
const { round2 } = require("@/utils/pricing");

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
    // 1) coupon usage — once per order
    if (order.coupon?.couponId && !order.couponCounted) {
        await Coupon.updateOne({ _id: order.coupon.couponId }, { $inc: { usedCount: 1 } });
        order.couponCounted = true;
        await order.save();
    }
    for (const item of order.items) {
        // 2) stock — once per item
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
            if (gatewayPaid > 0) order.paymentStatus = "refunded";
            order.refundedAt = new Date();
            order.refundAmount = given;
        }
    }

    order.revertedAt = new Date();
    await order.save();
};

const AUTO_COMPLETE_DAYS = Number(process.env.ORDER_AUTO_COMPLETE_DAYS || 7);
const completeDeliveredOrder = async (order, { auto = false } = {}) => {
    order.status = "completed";
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || new Date();
    if (auto) order.autoCompletedAt = new Date();
    if (order.paymentMethod === "cash") order.paymentStatus = "paid";
    await order.save();
};

/* shipped orders the buyer never confirmed → completed after AUTO_COMPLETE_DAYS */
const autoCompleteShippedOrders = async () => {
    const deadline = new Date(Date.now() - AUTO_COMPLETE_DAYS * 24 * 60 * 60 * 1000);

    const orders = await Order.find({
        status: "shipped",
        paymentStatus: "paid",
        shippedAt: { $lte: deadline },
        $or: [{ expectedDeliveryAt: null }, { expectedDeliveryAt: { $lte: deadline } }],
        autoCompletedAt: null,
    }).limit(200);

    for (const order of orders) {
        await completeDeliveredOrder(order, { auto: true });
        logger.info(`[order ${order._id}] auto-completed after ${AUTO_COMPLETE_DAYS} days, seller funds released`);
    }

    return orders.length;
};

const maybeMarkOrderShipped = (order) => {
    if (["shipped", "completed", "cancelled"].includes(order.status)) return;
    const allShipped = order.items.every((item) => item.fulfillment?.status === "shipped");
    if (allShipped) {
        order.status = "shipped";
        order.shippedAt = order.shippedAt || new Date();
    }
};

const markItemShipped = (item, trackingCode, estimatedDeliveryAt = null) => {
    item.fulfillment = {
        status: "shipped",
        trackingCode: trackingCode || item.fulfillment?.trackingCode || null,
        shippedAt: new Date(),
        estimatedDeliveryAt: estimatedDeliveryAt || null,
    };
};

/** order.expectedDeliveryAt = the latest arrival time among the items that have one */
const refreshExpectedDelivery = (order) => {
    const times = (order.items || [])
        .map((item) => item.fulfillment?.estimatedDeliveryAt)
        .filter(Boolean)
        .map((d) => new Date(d).getTime());
    order.expectedDeliveryAt = times.length ? new Date(Math.max(...times)) : null;
};

/** changes the expected arrival of an item that already shipped */
const setItemDeliveryEstimate = (order, item, estimatedDeliveryAt) => {
    if (["completed", "cancelled"].includes(order.status)) {
        throw new AppError(400, `The delivery time of a ${order.status} order can't be changed`);
    }
    if (item.fulfillment?.status !== "shipped") {
        throw new AppError(400, "Ship the item first, then set its delivery time");
    }
    item.fulfillment.estimatedDeliveryAt = estimatedDeliveryAt;
    order.markModified("items");
    refreshExpectedDelivery(order);
};

const assertShippable = (order) => {
    if (order.status === "created" || order.status === "cancelled") {
        throw new AppError(400, `Order cannot be marked as shipped from status "${order.status}"`);
    }
};

module.exports = {
    completeDeliveredOrder,
    autoCompleteShippedOrders,
    revertOrder,
    buildOrderIdSearchExpr,
    finalizeOrder,
    maybeMarkOrderShipped,
    markItemShipped,
    refreshExpectedDelivery,
    setItemDeliveryEstimate,
    assertShippable,
};
