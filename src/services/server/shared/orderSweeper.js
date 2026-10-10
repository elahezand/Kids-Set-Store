import Order from "@/model/order";
import User from "@/model/user";
import { notifyUser, NOTIFY_LINKS } from "@/utils/notify";
import logger from "@/utils/logger";
import { verifyPayment } from "@/services/server/shared/zarinpal";
import { walletSpentOn } from "@/services/server/shared/wallet";
import { round2 } from "@/utils/pricing";
import {
  finalizeOrder,
  revertOrder,
  autoCompleteShippedOrders,
  pastDueQuery,
  pastDueAt,
} from "@/services/server/shared/order";
const ABANDON_AFTER_MS = Number(process.env.ORDER_ABANDON_MINUTES || 30) * 60 * 1000;
const BATCH = 100;

const DAY_MS = 24 * 60 * 60 * 1000;
const COD_REMIND_EVERY_DAYS = Number(process.env.ORDER_COD_REMIND_DAYS || 7);

const STALE_CLAIM_MS = 2 * 60 * 1000;

const overdueCashQuery = () => ({
  status: "shipped",
  paymentMethod: "cash",
  paymentStatus: "pending",
  ...pastDueQuery(),
});

const errorText = (err) => err?.message || String(err);

const completeHalfFinishedOrders = async () => {
  const orders = await Order.find({
    finalizedAt: { $ne: null },
    status: { $nin: ["cancelled"] },
    $and: [
      { $or: [{ "items.stockReserved": false }, { status: "created" }] },
      { $or: [{ paymentMethod: "cash" }, { paymentStatus: "paid" }] },
    ],
  }).limit(BATCH);

  let fixed = 0;
  for (const order of orders) {
    try {
      await finalizeOrder(order);
      fixed++;
      logger.info(`[sweeper] finished order ${order._id}`);
    } catch (err) {
      logger.error(`[sweeper] could not finish order ${order._id}: ${errorText(err)}`);
    }
  }
  return fixed;
};

const resolvePendingPayments = async () => {
  const deadline = new Date(Date.now() - ABANDON_AFTER_MS);

  const candidates = await Order.find({
    paymentStatus: { $in: ["pending", "failed"] },
    paymentMethod: { $ne: "cash" },
    status: { $nin: ["cancelled", "completed"] },
    createdAt: { $lte: deadline },
  })
    .select("_id")
    .limit(BATCH)
    .lean();

  let paid = 0;
  let cancelled = 0;

  for (const { _id } of candidates) {
    try {
      const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);
      const order = await Order.findOneAndUpdate(
        {
          _id,
          paymentStatus: { $in: ["pending", "failed"] },
          status: { $nin: ["cancelled", "completed"] },
          $or: [{ finalizedAt: null }, { finalizedAt: { $lt: staleBefore } }],
        },
        { $set: { finalizedAt: new Date() } },
        { returnDocument: "after" }
      );
      if (!order) continue;

      let wasPaid = false;

      const walletSpent = await walletSpentOn(order._id);
      const orderTotal = round2((order.pricing.total || 0) + (order.pricing.walletUsed || 0));
      if (walletSpent > 0 && !order.pricing.walletUsed) {
        order.pricing.walletUsed = walletSpent;
        order.pricing.total = round2(Math.max(0, orderTotal - walletSpent));
      }

      if (order.paymentMethod === "wallet" || !order.payment?.authority) {
        wasPaid = walletSpent > 0 && walletSpent >= orderTotal - 0.005;
      } else {
        const result = await verifyPayment(order.payment.authority, Math.round(order.pricing.total * 10));
        if (result.unreachable) {
          order.finalizedAt = null;
          await order.save();
          continue;
        }
        wasPaid = result.success === true;
        if (wasPaid) order.payment.refId = result.refId;
      }

      if (wasPaid) {
        if (!order.payment?.authority) order.paymentMethod = "wallet";
        order.paymentStatus = "paid";
        order.set("payment.paidAt", order.payment?.paidAt || new Date());
        await order.save();

        await finalizeOrder(order);
        paid++;
        logger.info(`[sweeper] order ${order._id} was paid after all - finalized`);
      } else {
        order.finalizedAt = null;
        order.status = "cancelled";
        order.$locals.skipStatusNotify = true;
        await order.save();
        await revertOrder(order);
        cancelled++;
        logger.info(`[sweeper] order ${order._id} was never paid - cancelled`);
      }
    } catch (err) {
      logger.error(`[sweeper] could not settle the payment of order ${_id}: ${errorText(err)}`);
    }
  }
  return { paid, cancelled };
};

const flagOverdueCashOrders = async () => {
  const remindBefore = new Date(Date.now() - COD_REMIND_EVERY_DAYS * DAY_MS);

  const orders = await Order.find({
    $and: [
      overdueCashQuery(),
      { $or: [{ cashOverdueNotifiedAt: null }, { cashOverdueNotifiedAt: { $lte: remindBefore } }] },
    ],
  }).limit(BATCH);

  if (!orders.length) return 0;

  const admins = await User.find({ role: "ADMIN" }).select("_id").lean();
  let flagged = 0;

  for (const order of orders) {
    try {
      const claim = await Order.updateOne(
        {
          _id: order._id,
          $or: [{ cashOverdueNotifiedAt: null }, { cashOverdueNotifiedAt: { $lte: remindBefore } }],
        },
        { $set: { cashOverdueNotifiedAt: new Date() } }
      );
      if (!claim.modifiedCount) continue;

      const shortId = String(order._id).slice(-6).toUpperCase();
      const days = Math.max(1, Math.floor((Date.now() - pastDueAt(order).getTime()) / DAY_MS));

      for (const admin of admins) {
        await notifyUser(
          admin._id,
          `Cash order #${shortId} is ${days} day(s) past its delivery date and still unpaid - collect the cash, then press "Cash received"`,
          { type: "cod_overdue", link: NOTIFY_LINKS.adminOrders }
        );
      }

      flagged++;
      logger.info(`[sweeper] cash order ${order._id} overdue - admins reminded`);
    } catch (err) {
      logger.error(`[sweeper] overdue reminder for order ${order._id} failed: ${errorText(err)}`);
    }
  }

  return flagged;
};

const step = async (name, fn, fallback) => {
  try {
    return await fn();
  } catch (err) {
    logger.error(`[sweeper] ${name} failed: ${errorText(err)}`);
    return fallback;
  }
};

const runOrderSweeps = async () => {
  const finished = await step("finish half-finished orders", completeHalfFinishedOrders, 0);
  const payments = await step("settle pending payments", resolvePendingPayments, { paid: 0, cancelled: 0 });
  const completed = await step("auto-complete", autoCompleteShippedOrders, 0);
  const overdueCash = await step("overdue cash reminders", flagOverdueCashOrders, 0);
  return { finished, ...payments, completed, overdueCash };
};

export { flagOverdueCashOrders, overdueCashQuery, completeHalfFinishedOrders, resolvePendingPayments, runOrderSweeps };

export default {
  flagOverdueCashOrders,
  overdueCashQuery,
  completeHalfFinishedOrders,
  resolvePendingPayments,
  runOrderSweeps,
};
