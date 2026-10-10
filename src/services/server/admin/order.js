import Order from "@/model/order";
import { paginate } from "@/utils/paginate";
import { runOrderSweeps } from "@/services/server/shared/orderSweeper";

import {
  buildOrderIdSearchExpr,
  markOrderShipped,
  revertOrder,
  finalizeOrder,
  completeDeliveredOrder,
  setOrderDeliveryEstimate,
  isPastDue,
  pastDueQuery,
} from "@/services/server/shared/order";

import { notifyOrderShipped, notifyDeliveryUpdated } from "@/services/server/shared/deliveryNotice";

import { buildListQuery, listLimit } from "@/utils/listQuery";

const ADMIN_UPDATABLE_FIELDS = ["paymentStatus", "status", "isDelivered", "deliveredAt"];

const ALLOWED_STATUS_MOVES = {
  created: ["cancelled"],
  processing: ["cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

const ALLOWED_PAYMENT_MOVES = {
  pending: ["failed"],
  failed: [],
  paid: [],
  refunded: [],
};

const getAllOrders = async (query = {}) => {
  const limit = listLimit(query, 20);

  const filters = buildListQuery(query, {
    statuses: ["created", "processing", "shipped", "completed", "cancelled"],
    ids: {
      user: "user",
    },
  });

  if (!query.status || query.status === "all") {
    filters.status = {
      $ne: "cancelled",
    };
  }

  if (query.paymentStatus && query.paymentStatus !== "all") {
    filters.paymentStatus = query.paymentStatus;
  }

  if (query.paymentMethod && query.paymentMethod !== "all") {
    filters.paymentMethod = query.paymentMethod;
  }

  if (query.awaitingCash === "true") {
    Object.assign(filters, {
      status: "shipped",
      paymentMethod: "cash",
      paymentStatus: "pending",
    });
  }

  if (query.overdueCash === "true") {
    const { overdueCashQuery } = await import("@/services/server/shared/orderSweeper");

    Object.assign(filters, overdueCashQuery());
  }

  const searchExpr = buildOrderIdSearchExpr(query.q);

  if (searchExpr) {
    filters.$expr = searchExpr;
  }

  const result = await paginate(Order, {
    limit,
    cursor: query.cursor,
    filters,
    populate: { path: "user", select: "username phone" },
    sort: {
      _id: -1,
    },
  });

  const data = result.data.map((order) => ({
    ...order,
    isCashOverdue:
      order.status === "shipped" &&
      order.paymentMethod === "cash" &&
      order.paymentStatus === "pending" &&
      isPastDue(order),
  }));

  return {
    data,
    pagination: result.pagination,
  };
};

const shipOrder = async (orderId, trackingCode, estimatedDeliveryAt = null) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  if (order.status !== "processing") {
    return {
      success: false,
      status: 400,
      message: `Only a processing order can be shipped (this one is "${order.status}")`,
    };
  }

  markOrderShipped(order, trackingCode, estimatedDeliveryAt);
  order.$locals.skipStatusNotify = true;
  await order.save();

  await notifyOrderShipped(order);

  return {
    success: true,
    data: order,
  };
};

const adminSetDeliveryEstimate = async (orderId, estimatedDeliveryAt) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  setOrderDeliveryEstimate(order, estimatedDeliveryAt);
  await order.save();

  await notifyDeliveryUpdated(order);

  return {
    success: true,
    data: order,
  };
};

const getOrderByIdAdmin = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "username phone")
    .populate("items.productId", "title images");

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

const assertAdminOrderChange = (order, data) => {
  if (data.status && data.status !== order.status) {
    const allowed = ALLOWED_STATUS_MOVES[order.status] || [];

    if (!allowed.includes(data.status)) {
      return {
        success: false,
        status: 400,
        message: `An order can't go from "${order.status}" to "${data.status}"`,
      };
    }

    if (data.status === "completed" && order.paymentMethod !== "cash" && order.paymentStatus !== "paid") {
      return {
        success: false,
        status: 400,
        message: "An unpaid online order can't be completed",
      };
    }
  }

  if (data.paymentStatus && data.paymentStatus !== order.paymentStatus) {
    const allowed = ALLOWED_PAYMENT_MOVES[order.paymentStatus] || [];

    const cashPaid = order.paymentMethod === "cash" && data.paymentStatus === "paid";

    if (!allowed.includes(data.paymentStatus) && !cashPaid) {
      return {
        success: false,
        status: 400,
        message: `Payment status can't go from "${order.paymentStatus}" to "${data.paymentStatus}"`,
      };
    }
  }

  return {
    success: true,
  };
};

const updateOrder = async (orderId, data) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  const validation = assertAdminOrderChange(order, data);

  if (!validation.success) {
    return validation;
  }

  const wasStatus = order.status;

  if (data.status === "cancelled") order.$locals.skipStatusNotify = true;

  for (const field of ADMIN_UPDATABLE_FIELDS) {
    if (data[field] !== undefined) {
      order[field] = data[field];
    }
  }

  await order.save();

  if (wasStatus !== "completed" && order.status === "completed") {
    await completeDeliveredOrder(order);
  }

  if (wasStatus !== "cancelled" && order.status === "cancelled") {
    await revertOrder(order);
  }

  return {
    success: true,
    data: order,
  };
};

const getStuckOrders = async () => {
  const orders = await Order.find({
    finalizedAt: {
      $ne: null,
    },
    status: {
      $ne: "cancelled",
    },
    $or: [
      {
        "items.stockReserved": false,
      },
      {
        status: "created",
        $or: [{ paymentMethod: "cash" }, { paymentStatus: "paid" }],
      },
    ],
  })
    .sort({
      createdAt: -1,
    })
    .limit(100)
    .populate("user", "username phone")
    .lean();

  return {
    data: orders,
    pagination: {
      limit: 100,
      nextCursor: null,
      hasMore: false,
    },
  };
};

const repairOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      status: 404,
      message: "Order not found",
    };
  }

  if (!order.finalizedAt) {
    return {
      success: false,
      status: 400,
      message: "This order never reached the payment step",
    };
  }

  if (order.paymentMethod !== "cash" && order.paymentStatus !== "paid") {
    return {
      success: false,
      status: 400,
      message: "This order is not paid yet",
    };
  }

  await finalizeOrder(order);

  await order.save();

  return {
    success: true,
    data: order,
  };
};

const getSweepStatus = async () => {
  const [dueForCompletion, overdueCash] = await Promise.all([
    Order.countDocuments({
      status: "shipped",
      paymentStatus: "paid",
      autoCompletedAt: null,
      ...pastDueQuery(),
    }),
    Order.countDocuments({
      status: "shipped",
      paymentMethod: "cash",
      paymentStatus: "pending",
      ...pastDueQuery(),
    }),
  ]);

  return {
    dueForCompletion,
    overdueCash,
    timerDisabled: process.env.DISABLE_ORDER_SWEEPER === "true",
    timerMinutes: Number(process.env.ORDER_SWEEP_MINUTES || 10),
    cronConfigured: Boolean(process.env.CRON_SECRET),
  };
};

const runAutoComplete = async () => {
  const result = await runOrderSweeps();

  return {
    success: true,
    data: result,
  };
};

const markDelivered = async (orderId) => {
  const order = await Order.findById(orderId);

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
      status: 400,
      message: "Only a shipped order can be marked as delivered",
    };
  }

  await completeDeliveredOrder(order);

  return {
    success: true,
    data: order,
  };
};

export {
  ALLOWED_STATUS_MOVES,
  shipOrder,
  adminSetDeliveryEstimate,
  markDelivered,
  runAutoComplete,
  getSweepStatus,
  getStuckOrders,
  repairOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrder,
};

export default {
  ALLOWED_STATUS_MOVES,
  shipOrder,
  adminSetDeliveryEstimate,
  markDelivered,
  runAutoComplete,
  getSweepStatus,
  getStuckOrders,
  repairOrder,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrder,
};
