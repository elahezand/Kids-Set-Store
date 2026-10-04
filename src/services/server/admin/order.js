import Order from "@/model/order";
import { paginate } from "@/utils/paginate";
import { runOrderSweeps } from "@/services/server/shared/orderSweeper" ;

import {
    buildOrderIdSearchExpr,
    maybeMarkOrderShipped,
    markItemShipped,
    revertOrder,
    finalizeOrder,
    completeDeliveredOrder,
    refreshExpectedDelivery,
    setItemDeliveryEstimate,
    assertShippable,
} from "@/services/server/shared/order";

import {
    notifyItemShipped,
    notifyDeliveryUpdated,
} from "@/services/server/shared/deliveryNotice";

import { buildListQuery, listLimit } from "@/utils/listQuery";

const OVERDUE_DAYS = Number(
    process.env.ORDER_AUTO_COMPLETE_DAYS || 7
);

const ADMIN_UPDATABLE_FIELDS = [
    "paymentStatus",
    "status",
    "isDelivered",
    "deliveredAt",
];

const ALLOWED_STATUS_MOVES = {
    created: ["cancelled"],
    processing: ["cancelled"],
    shipped: ["completed", "cancelled"],
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
        statuses: [
            "created",
            "processing",
            "shipped",
            "completed",
            "cancelled",
        ],
        ids: {
            user: "user",
        },
    });

    if (!query.status || query.status === "all") {
        filters.status = {
            $ne: "cancelled",
        };
    }

    if (
        query.paymentStatus &&
        query.paymentStatus !== "all"
    ) {
        filters.paymentStatus = query.paymentStatus;
    }

    if (
        query.paymentMethod &&
        query.paymentMethod !== "all"
    ) {
        filters.paymentMethod = query.paymentMethod;
    }

    if (query.overdueCash === "true") {
        const { overdueCashQuery } = await import(
            "@/services/server/shared/orderSweeper"
        );

        Object.assign(
            filters,
            overdueCashQuery()
        );
    }

    const searchExpr = buildOrderIdSearchExpr(
        query.q
    );

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
            !!order.shippedAt &&
            Date.now() -
            new Date(order.shippedAt).getTime() >=
            OVERDUE_DAYS *
            24 *
            60 *
            60 *
            1000,
    }));

    return {
        data,
        pagination: result.pagination,
    };
};

const adminShipItem = async (
    orderId,
    itemId,
    trackingCode,
    estimatedDeliveryAt = null
) => {
    const order = await Order.findById(orderId);

    if (!order) {
        return {
            success: false,
            status: 404,
            message: "Order not found",
        };
    }

    const item = order.items.id(itemId);

    if (!item) {
        return {
            success: false,
            status: 404,
            message: "Item not found in this order",
        };
    }

    if (item.fulfillment?.status === "shipped") {
        return {
            success: false,
            status: 409,
            message: "This item is already marked as shipped",
        };
    }

    // throws AppError(400) for "created" / "cancelled" orders
    assertShippable(order);

    markItemShipped(
        item,
        trackingCode,
        estimatedDeliveryAt
    );

    order.markModified("items");

    refreshExpectedDelivery(order);

    maybeMarkOrderShipped(order);

    await order.save();

    await notifyItemShipped(order, item);

    return {
        success: true,
        data: order,
    };
};

const adminSetDeliveryEstimate = async (
    orderId,
    itemId,
    estimatedDeliveryAt
) => {
    const order = await Order.findById(orderId);

    if (!order) {
        return {
            success: false,
            status: 404,
            message: "Order not found",
        };
    }

    const item = order.items.id(itemId);

    if (!item) {
        return {
            success: false,
            status: 404,
            message: "Item not found in this order",
        };
    }

    setItemDeliveryEstimate(
        order,
        item,
        estimatedDeliveryAt
    );

    await order.save();

    await notifyDeliveryUpdated(order, item);

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
    if (
        data.status &&
        data.status !== order.status
    ) {
        const allowed =
            ALLOWED_STATUS_MOVES[order.status] || [];

        if (!allowed.includes(data.status)) {
            return {
                success: false,
                status: 400,
                message: `An order can't go from "${order.status}" to "${data.status}"`,
            };
        }

        if (
            data.status === "completed" &&
            order.paymentMethod !== "cash" &&
            order.paymentStatus !== "paid"
        ) {
            return {
                success: false,
                status: 400,
                message:
                    "An unpaid online order can't be completed",
            };
        }
    }

    if (
        data.paymentStatus &&
        data.paymentStatus !== order.paymentStatus
    ) {
        const allowed =
            ALLOWED_PAYMENT_MOVES[
            order.paymentStatus
            ] || [];

        const cashPaid =
            order.paymentMethod === "cash" &&
            data.paymentStatus === "paid";

        if (
            !allowed.includes(data.paymentStatus) &&
            !cashPaid
        ) {
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

    const validation = assertAdminOrderChange(
        order,
        data
    );

    if (!validation.success) {
        return validation;
    }

    const wasStatus = order.status;

    for (const field of ADMIN_UPDATABLE_FIELDS) {
        if (data[field] !== undefined) {
            order[field] = data[field];
        }
    }

    await order.save();

    if (
        wasStatus !== "completed" &&
        order.status === "completed"
    ) {
        await completeDeliveredOrder(order);
    }

    if (
        wasStatus !== "cancelled" &&
        order.status === "cancelled"
    ) {
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
        ],
    })
        .sort({
            createdAt: -1,
        })
        .limit(100);

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
            message:
                "This order never reached the payment step",
        };
    }

    if (
        order.paymentMethod !== "cash" &&
        order.paymentStatus !== "paid"
    ) {
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
            message:
                "Only a shipped order can be marked as delivered",
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
    adminSetDeliveryEstimate,
    markDelivered,
    runAutoComplete,
    getStuckOrders,
    repairOrder,
    getAllOrders,
    getOrderByIdAdmin,
    updateOrder,
    adminShipItem,
};

export default {
    ALLOWED_STATUS_MOVES,
    adminSetDeliveryEstimate,
    markDelivered,
    runAutoComplete,
    getStuckOrders,
    repairOrder,
    getAllOrders,
    getOrderByIdAdmin,
    updateOrder,
    adminShipItem,
};
