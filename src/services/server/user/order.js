import Cart from "@/model/cart";
import Coupon from "@/model/coupon";
import { paginateList } from "@/utils/listQuery";
import Order from "@/model/order";
import User from "@/model/user";

import { spendFromWallet, refundToWallet } from "@/services/server/shared/wallet";

import { calculateCartTotals } from "@/utils/helper";
import { getCouponProblemForUser } from "@/services/server/shared/cart";

import { round2 } from "@/utils/pricing";
import { notifyUser, NOTIFY_LINKS } from "@/utils/notify";
import logger from "@/utils/logger";

import { createPayment, paymentUrl as payUrl, tomanToRial as toRial } from "@/services/server/shared/zarinpal";

import {
  buildOrderIdSearchExpr,
  finalizeOrder,
  revertOrder,
  completeDeliveredOrder,
  reserveStock,
  releaseStock,
} from "@/services/server/shared/order";

import { isValidObjectId } from "mongoose";

const DAY_MS = 24 * 60 * 60 * 1000;

const checkout = async (userId, shippingAddress, paymentMethod, idempotencyKey = null, useWallet = false) => {
  if (idempotencyKey) {
    const existing = await Order.findOne({
      user: userId,
      idempotencyKey,
    });

    if (existing) {
      return {
        success: true,
        data: {
          order: existing,
          paymentUrl: existing.payment?.authority ? payUrl(existing.payment.authority) : null,
        },
      };
    }
  }

  const cart = await Cart.findOneAndUpdate(
    {
      user: userId,
      status: "active",
      "items.0": { $exists: true },
    },
    {
      $set: {
        status: "converted",
      },
    },
    {
      returnDocument: "after",
    }
  ).populate("coupon");

  if (!cart) {
    return {
      success: false,
      status: 400,
      message: "Cart is empty or is already being checked out",
    };
  }

  let walletSpent = 0;
  let createdOrder = null;

  const unlockCart = () =>
    Cart.updateOne({ _id: cart._id }, { $set: { status: "active" } }).catch((error) =>
      logger.error(`[checkout] could not unlock cart ${cart._id}:`, error)
    );

  const rollback = async (reason) => {
    if (createdOrder?.couponCounted && createdOrder.paymentStatus !== "paid") {
      try {
        const released = await Order.updateOne(
          { _id: createdOrder._id, couponCounted: true },
          { $set: { couponCounted: false } }
        );
        if (released.modifiedCount) {
          await Coupon.updateOne({ _id: createdOrder.coupon.couponId }, { $inc: { usedCount: -1 } });
        }
        createdOrder.couponCounted = false;
      } catch (error) {
        logger.error(`[checkout] could not release coupon of order ${createdOrder._id}:`, error);
      }
    }

    if (createdOrder) {
      if (createdOrder.paymentStatus !== "paid") {
        await releaseStock(createdOrder).catch((error) =>
          logger.error(`[checkout] could not release stock of order ${createdOrder._id}:`, error)
        );
      }

      await Order.updateOne(
        { _id: createdOrder._id, paymentStatus: { $ne: "paid" } },
        { $set: { status: "cancelled", paymentStatus: "failed" } }
      ).catch((error) => logger.error(`[checkout] could not cancel order ${createdOrder._id}:`, error));
    }

    await unlockCart();

    if (walletSpent > 0 && createdOrder) {
      await refundToWallet(userId, createdOrder._id, walletSpent, reason);
      walletSpent = 0;
    }
  };

  try {
    const coupon = cart.coupon || null;

    if (coupon) {
      const { pricing: base } = await calculateCartTotals(cart.items, null, 0);
      const couponProblem = await getCouponProblemForUser(coupon, userId, base.subtotal);

      if (couponProblem) {
        await Cart.updateOne({ _id: cart._id }, { $set: { coupon: null, status: "active" } });
        return { success: false, status: 409, message: `${couponProblem}. The coupon was removed from your cart.` };
      }
    }

    const totals = await calculateCartTotals(cart.items, coupon);

    if (totals.skippedItems.length > 0) {
      await unlockCart();

      return {
        success: false,
        status: 409,
        message: "Some items are no longer available",
        details: totals.skippedItems,
      };
    }

    const buyer = useWallet ? await User.findById(userId).select("wallet").lean() : null;

    const walletPlanned = buyer ? Math.min(buyer.wallet?.balance || 0, totals.pricing.total) : 0;

    const pricing = {
      ...totals.pricing,
      walletUsed: 0,
    };

    const orderItems = totals.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || null,

      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      finalPrice: item.finalPrice,

      productSnapshot: {
        title: item.productInfo.title,
        image: item.productInfo.images[0] || null,
        slug: item.productInfo.slug,
      },

      variantSnapshot: item.variantSnapshot || {
        attributes: null,
        sku: null,
      },

      estimatedShipBy: new Date(Date.now() + (item.shipsWithinDays ?? 3) * DAY_MS),
    }));

    const order = (createdOrder = await Order.create({
      user: cart.user,
      items: orderItems,

      coupon: coupon
        ? {
            couponId: coupon._id,
            code: coupon.code,
            type: coupon.type,
            amount: coupon.amount,
            maxDiscount: coupon.maxDiscount ?? null,
          }
        : null,

      pricing,
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      status: "created",
      idempotencyKey,
    }));

    let paymentUrl = null;

    const outOfStock = await reserveStock(order);

    if (outOfStock) {
      await rollback("out of stock");

      return {
        success: false,
        status: 409,
        message: `${outOfStock.productSnapshot?.title || "An item"} just sold out. Please check your cart.`,
      };
    }

    if (coupon) {
      const claimed = await Coupon.updateOne(
        {
          _id: coupon._id,
          $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
        },
        { $inc: { usedCount: 1 } }
      );

      if (!claimed.modifiedCount) {
        await rollback("coupon limit reached");
        return { success: false, status: 409, message: "Coupon usage limit reached" };
      }

      order.couponCounted = true;
      await order.save();
    }

    if (walletPlanned > 0) {
      const charged = await spendFromWallet(userId, order._id, walletPlanned);

      if (charged > 0) {
        walletSpent = charged;

        order.pricing.walletUsed = charged;

        order.pricing.total = round2(order.pricing.total - charged);

        await order.save();
      }
    }

    if (order.pricing.total === 0) {
      if (order.pricing.walletUsed > 0) order.paymentMethod = "wallet";
      order.paymentStatus = "paid";
      order.finalizedAt = new Date();
      order.payment = {
        authority: null,
        refId: null,
        paidAt: new Date(),
      };

      await order.save();

      await finalizeOrder(order);
      await order.save();

      return {
        success: true,
        data: {
          order,
          paymentUrl: null,
        },
      };
    }

    if ((paymentMethod === "wallet" || paymentMethod === "zarinpal") && order.pricing.total > 0) {
      const payment = await createPayment(
        toRial(order.pricing.total),
        `Order ${order._id}`,
        shippingAddress?.phone || undefined
      );

      if (!payment?.data?.authority) {
        await rollback("payment init failed");

        return {
          success: false,
          status: 502,
          message: "Payment init failed",
        };
      }

      order.paymentMethod = "zarinpal";

      order.payment = {
        authority: payment.data.authority,
        refId: null,
        paidAt: null,
      };

      paymentUrl = payUrl(payment.data.authority);

      await order.save();
    }

    if (paymentMethod === "cash") {
      order.finalizedAt = order.finalizedAt || new Date();

      await order.save();

      await finalizeOrder(order);
      await order.save();
    }

    return {
      success: true,
      data: {
        order,
        paymentUrl,
      },
    };
  } catch (error) {
    await rollback("checkout failed");
    throw error;
  }
};

const getMyOrders = async (userId, query = {}) => {
  const searchExpr = buildOrderIdSearchExpr(query.q);

  return paginateList(Order, query, {
    maxLimit: 50,
    base: { user: userId },
    statuses: ["created", "processing", "shipped", "completed", "cancelled"],
    filters: searchExpr ? { $expr: searchExpr } : {},
  });
};

const getOrderById = async (orderId, userId) => {
  if (!isValidObjectId(orderId)) {
    return {
      success: false,
      status: 400,
      message: "Invalid order id",
    };
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  return {
    success: true,
    data: order,
  };
};

const OWNER_UPDATABLE_FIELDS = ["shippingAddress"];

const updateOrderByOwner = async (orderId, userId, data) => {
  if (!isValidObjectId(orderId)) {
    return {
      success: false,
      status: 400,
      message: "Invalid order id",
    };
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  if (["shipped", "completed", "cancelled"].includes(order.status)) {
    return {
      success: false,
      status: 400,
      message: "Order can no longer be modified",
    };
  }

  for (const field of OWNER_UPDATABLE_FIELDS) {
    if (data[field] !== undefined) {
      order[field] = {
        ...order[field]?.toObject?.(),
        ...data[field],
      };
    }
  }

  const updatedOrder = await order.save();

  return {
    success: true,
    data: updatedOrder,
  };
};

const cancelOrder = async (orderId, userId) => {
  if (!isValidObjectId(orderId)) {
    return {
      success: false,
      status: 400,
      message: "Invalid order id",
    };
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  if (["shipped", "completed", "cancelled"].includes(order.status)) {
    return {
      success: false,
      status: 400,
      message: "Order cannot be cancelled",
    };
  }

  order.status = "cancelled";
  order.$locals.skipStatusNotify = true;

  await order.save();

  await revertOrder(order);

  return {
    success: true,
    data: order,
  };
};

const confirmDelivery = async (orderId, userId) => {
  if (!isValidObjectId(orderId)) {
    return {
      success: false,
      status: 400,
      message: "Invalid order id",
    };
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  if (order.status !== "shipped") {
    return {
      success: false,
      status: 409,
      message: `Order can only be confirmed as received from "shipped" status (currently "${order.status}")`,
    };
  }

  if (order.paymentMethod === "cash" && order.paymentStatus !== "paid") {
    if (order.isDelivered) {
      return {
        success: false,
        status: 409,
        message: "You already confirmed this order - it completes once the payment is confirmed",
      };
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    const admins = await User.find({ role: "ADMIN" }).select("_id").lean();
    const shortId = String(order._id).slice(-6).toUpperCase();
    for (const admin of admins) {
      await notifyUser(
        admin._id,
        `Cash order #${shortId}: the customer confirmed receipt - check the courier handed over the money, then press "Cash received"`,
        { type: "cod_received", link: NOTIFY_LINKS.adminOrders }
      );
    }

    return {
      success: true,
      message: "Thanks! The order completes once your cash payment is confirmed.",
      data: order,
    };
  }

  await completeDeliveredOrder(order);

  return {
    success: true,
    message: "Thanks! Your order is marked as completed.",
    data: order,
  };
};

export default {
  checkout,
  getMyOrders,
  getOrderById,
  updateOrderByOwner,
  cancelOrder,
  confirmDelivery,
};
