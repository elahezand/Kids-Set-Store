const Order = require("@/model/order");
const User = require("@/model/user");
const { notifyUser } = require("@/utils/notify");
const logger = require("@/utils/logger");
const { verifyPayment } = require("./zarinpal");
const { walletSpentOn } = require("@/services/server/shared/wallet");
const { finalizeOrder, revertOrder, autoCompleteShippedOrders } = require("@/services/server/shared/order");

const ABANDON_AFTER_MS = Number(process.env.ORDER_ABANDON_MINUTES || 30) * 60 * 1000;
const BATCH = 100;

const DAY_MS = 24 * 60 * 60 * 1000;
const COD_OVERDUE_DAYS = Number(process.env.ORDER_AUTO_COMPLETE_DAYS || 7);
const COD_REMIND_EVERY_DAYS = Number(process.env.ORDER_COD_REMIND_DAYS || 7);

/** query for shipped cash orders nobody confirmed in time (shared with the admin filter) */
const overdueCashQuery = () => ({
    status: "shipped",
    paymentMethod: "cash",
    paymentStatus: "pending",
    shippedAt: { $lte: new Date(Date.now() - COD_OVERDUE_DAYS * DAY_MS) },
});

/* 1) money already taken, finalize never finished → continue it */
const completeHalfFinishedOrders = async () => {
    const orders = await Order.find({
        finalizedAt: { $ne: null },
        status: { $nin: ["cancelled"] },
        items: { stockReserved: false }
    }).limit(BATCH);

    let fixed = 0;
    for (const order of orders) {
        if (order.paymentMethod !== "cash" && order.paymentStatus !== "paid") continue;
        await finalizeOrder(order);

        await order.save();
        fixed++;
        logger.info(`[sweeper] finished order ${order._id}`);
    }
    return fixed;
};

/* 2) orders still waiting for payment → ask the real source, then finish or cancel */
const resolvePendingPayments = async () => {
    const deadline = new Date(Date.now() - ABANDON_AFTER_MS);

    const orders = await Order.find({
        // "failed" too: a failed gateway payment may still hold money the wallet already paid
        paymentStatus: { $in: ["pending", "failed"] },
        paymentMethod: { $ne: "cash" },
        status: { $nin: ["cancelled", "completed"] },
        createdAt: { $lte: deadline },
    }).limit(BATCH);

    let paid = 0;
    let cancelled = 0;

    for (const order of orders) {
        let wasPaid = false;

        if (order.paymentMethod === "wallet") {
            wasPaid = (await walletSpentOn(order._id)) > 0;
        } else if (order.payment?.authority) {
            const result = await verifyPayment(order.payment.authority, Math.round(order.pricing.total * 10));
            // gateway unreachable → decide next round instead of cancelling a maybe-paid order
            if (result.unreachable) continue;
            wasPaid = result.success === true;
            if (wasPaid) order.payment.refId = result.refId;
        }
        // no authority and no wallet charge → the buyer never reached the gateway

        if (wasPaid) {
            order.paymentStatus = "paid";
            order.payment.paidAt = order.payment.paidAt || new Date();
            order.finalizedAt = order.finalizedAt || new Date();
            await order.save();

            await finalizeOrder(order);
            await order.save();
            paid++;
            logger.info(`[sweeper] order ${order._id} was paid after all — finalized`);
        } else {
            order.status = "cancelled";
            await order.save();
            await revertOrder(order);
            cancelled++;
            logger.info(`[sweeper] order ${order._id} was never paid — cancelled`);
        }
    }
    return { paid, cancelled };
};

/*
 * 3) cash orders shipped long ago that nobody confirmed.
 */
const flagOverdueCashOrders = async () => {
    const remindBefore = new Date(Date.now() - COD_REMIND_EVERY_DAYS * DAY_MS);

    const orders = await Order.find({
        ...overdueCashQuery(),
        $or: [{ cashOverdueNotifiedAt: null }, { cashOverdueNotifiedAt: { $lte: remindBefore } }],
    }).limit(BATCH);

    if (!orders.length) return 0;

    const admins = await User.find({ role: "ADMIN" }).select("_id").lean();

    for (const order of orders) {
        const shortId = String(order._id).slice(-6).toUpperCase();
        const days = Math.floor((Date.now() - new Date(order.shippedAt).getTime()) / DAY_MS);

        for (const admin of admins) {
            await notifyUser(
                admin._id,
                `Cash order #${shortId} was shipped ${days} days ago and is still unconfirmed — mark it delivered or cancel it`,
                { type: "cod_overdue", link: "/p-admin" }
            );
        }

        order.cashOverdueNotifiedAt = new Date();
        await order.save();
        logger.info(`[sweeper] cash order ${order._id} overdue — admins reminded`);
    }

    return orders.length;
};

const runOrderSweeps = async () => {
    const finished = await completeHalfFinishedOrders();
    const payments = await resolvePendingPayments();
    const completed = await autoCompleteShippedOrders();
    const overdueCash = await flagOverdueCashOrders();
    return { finished, ...payments, completed, overdueCash };
};

module.exports = {
    flagOverdueCashOrders,
    overdueCashQuery,
    completeHalfFinishedOrders,
    resolvePendingPayments,
    runOrderSweeps,
};
