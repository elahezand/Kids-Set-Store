import Cart from "@/model/cart";
import Order from "@/model/order";
import User from "@/model/user";

import {
    spendFromWallet,
    refundToWallet,
} from "@/services/shared/wallet";

import {
    paginate,
    calculateCartTotals,
    getCouponProblem,
} from "@/utils/helper";

import { round2 } from "@/utils/pricing";
import logger from "@/utils/logger";

import { createPayment } from "@/services/shared/zarinpal";

import {
    buildOrderIdSearchExpr,
    finalizeOrder,
    revertOrder,
    completeDeliveredOrder,
} from "@/services/shared/order";

import {
    buildListQuery,
    listLimit,
} from "@/utils/listQuery";

import { isValidObjectId } from "mongoose";

const DAY_MS = 24 * 60 * 60 * 1000;

const START_PAY_URL =
    process.env.ZARINPAL_PAYMENT_BASE_URL ||
    "https://payment.zarinpal.com/pg/StartPay/";

const payUrl = (authority) =>
    `${START_PAY_URL.replace(/\/?$/, "/")}${authority}`;

const toRial = (toman) =>
    Math.round(Number(toman || 0) * 10);

/* ========================= CHECKOUT ========================= */

const checkout = async (
    userId,
    shippingAddress,
    paymentMethod,
    idempotencyKey = null,
    useWallet = false
) => {
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
                    paymentUrl: existing.payment?.authority
                        ? payUrl(existing.payment.authority)
                        : null,
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
        Cart.updateOne(
            { _id: cart._id },
            { $set: { status: "active" } }
        ).catch((error) =>
            logger.error(
                `[checkout] could not unlock cart ${cart._id}:`,
                error
            )
        );

    try {
        const coupon =
            cart.coupon && !getCouponProblem(cart.coupon)
                ? cart.coupon
                : null;

        const totals = await calculateCartTotals(
            cart.items,
            coupon,
            cart.shippingCost || 0
        );

        if (totals.skippedItems.length > 0) {
            await unlockCart();

            return {
                success: false,
                status: 409,
                message: "Some items are no longer available",
                details: totals.skippedItems,
            };
        }

        const buyer = useWallet
            ? await User.findById(userId)
                .select("wallet")
                .lean()
            : null;

        const walletPlanned = buyer
            ? Math.min(
                buyer.wallet?.balance || 0,
                totals.pricing.total
            )
            : 0;

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

            variantSnapshot:
                item.variantSnapshot || {
                    attributes: null,
                    sku: null,
                },

            fulfillment: {
                status: "pending",
                trackingCode: null,
                shippedAt: null,
            },

            estimatedShipBy: new Date(
                Date.now() +
                (item.shipsWithinDays ?? 3) * DAY_MS
            ),
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
                    maxDiscount:
                        coupon.maxDiscount ?? null,
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

        /* ========================= WALLET ========================= */

        if (walletPlanned > 0) {
            order.finalizedAt = new Date();
            await order.save();

            const charged = await spendFromWallet(
                userId,
                order._id,
                walletPlanned
            );

            if (charged > 0) {
                walletSpent = charged;

                order.pricing.walletUsed = charged;

                order.pricing.total = round2(
                    order.pricing.total - charged
                );

                await order.save();
            }
        }

        /* ========================= FULL WALLET PAYMENT ========================= */

        if (
            order.pricing.total === 0 &&
            order.pricing.walletUsed > 0
        ) {
            order.paymentMethod = "wallet";
            order.paymentStatus = "paid";

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

        /* ========================= ZARINPAL ========================= */

        if (
            (paymentMethod === "wallet" ||
                paymentMethod === "zarinpal") &&
            order.pricing.total > 0
        ) {
            const payment = await createPayment(
                toRial(order.pricing.total),
                `Order ${order._id}`,
                shippingAddress?.phone || undefined
            );

            if (!payment?.data?.authority) {
                order.status = "cancelled";
                order.paymentStatus = "failed";

                await order.save();

                return {
                    success: false,
                    status: 502,
                    message: "Payment init failed",
                };
            }

            order.paymentMethod = "zarinpal";

            order.payment = {
                authority: payment.data.authority,
            };

            paymentUrl = payUrl(payment.data.authority);

            await order.save();
        }

        /* ========================= CASH ========================= */

        if (paymentMethod === "cash") {
            order.finalizedAt =
                order.finalizedAt || new Date();

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
        await unlockCart();

        if (walletSpent > 0 && createdOrder) {
            await refundToWallet(
                userId,
                createdOrder._id,
                walletSpent,
                "checkout failed"
            );
        }

        throw error;
    }
};

/* ========================= MY ORDERS ========================= */

const getMyOrders = async (userId, query = {}) => {
    const limit = listLimit(query, 20, 50);

    const filters = buildListQuery(query, {
        base: {
            user: userId,
        },
        statuses: [
            "created",
            "processing",
            "shipped",
            "completed",
            "cancelled",
        ],
    });

    const searchExpr = buildOrderIdSearchExpr(query.q);

    if (searchExpr) {
        filters.$expr = searchExpr;
    }

    return paginate(Order, {
        limit,
        cursor: query.cursor,
        filters,
        sort: { _id: -1 },
    });
};

/* ========================= GET ORDER ========================= */

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

/* ========================= UPDATE ORDER ========================= */

const OWNER_UPDATABLE_FIELDS = ["shippingAddress"];

const updateOrderByOwner = async (
    orderId,
    userId,
    data
) => {
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

    if (
        ["shipped", "completed", "cancelled"].includes(
            order.status
        )
    ) {
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

/* ========================= CANCEL ORDER ========================= */

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

    if (
        ["shipped", "completed", "cancelled"].includes(
            order.status
        )
    ) {
        return {
            success: false,
            status: 400,
            message: "Order cannot be cancelled",
        };
    }

    if (
        order.items?.some(
            (item) =>
                item.fulfillment?.status === "shipped"
        )
    ) {
        return {
            success: false,
            status: 400,
            message:
                "Part of this order has already been shipped — contact support to cancel it",
        };
    }

    order.status = "cancelled";

    await order.save();

    await revertOrder(order);

    return {
        success: true,
        data: order,
    };
};

/* ========================= CONFIRM DELIVERY ========================= */

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

    await completeDeliveredOrder(order);

    return {
        success: true,
        data: order,
    };
};

export {
    checkout,
    getMyOrders,
    getOrderById,
    updateOrderByOwner,
    cancelOrder,
    confirmDelivery,
};

export default {
    checkout,
    getMyOrders,
    getOrderById,
    updateOrderByOwner,
    cancelOrder,
    confirmDelivery,
};
