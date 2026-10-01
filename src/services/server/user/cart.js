import Coupon from "@/model/coupon";
import Cart from "@/model/cart";

import {
    mergeCartItems,
    calculateCartTotals,
    itemKey,
} from "@/utils/helper";

import {
    toStoredItem,
    getCouponProblem,
    buildCartView,
} from "@/services/server/shared/cart";

const findUsableCoupon = async (code) => {
    const couponDoc = await Coupon.findOne({
        code: String(code).trim().toUpperCase(),
    });

    const problem = getCouponProblem(couponDoc);

    if (problem) {
        return {
            success: false,
            status: couponDoc ? 400 : 404,
            message: problem,
        };
    }

    return { success: true, data: couponDoc };
};

const getOrCreateActiveCart = async (userId) => {
    try {
        return await Cart.findOneAndUpdate(
            { user: userId, status: "active" },
            {
                $setOnInsert: {
                    user: userId,
                    items: [],
                    status: "active",
                },
            },
            { returnDocument: "after", upsert: true }
        );
    } catch (err) {
        if (err?.code === 11000) {
            return Cart.findOne({ user: userId, status: "active" });
        }

        throw err;
    }
};

const getUserCart = async (userId) => {
    const cart = await getOrCreateActiveCart(userId);

    return await buildCartView(cart);
};

const addToCart = async (userId, rawItems) => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
        return {
            success: false,
            status: 400,
            message: "Items are required",
        };
    }

    const cart = await getOrCreateActiveCart(userId);

    const mergedItems = mergeCartItems(
        cart.items.map(
            (item) => item.toObject?.() ?? item
        ),
        rawItems
    );

    const totals = await calculateCartTotals(
        mergedItems,
        null,
        0
    );

    const resultKeys = new Set(
        totals.items.map((item) => itemKey(item))
    );

    const droppedRequested = rawItems.filter(
        (item) => !resultKeys.has(itemKey(item))
    );

    if (droppedRequested.length > 0) {
        return {
            success: false,
            status: 400,
            message: "Some items could not be added to the cart.",
            details: totals.skippedItems,
        };
    }

    cart.items = totals.items.map(toStoredItem);

    await cart.save();

    return {
        success: true,
        data: await buildCartView(cart, {
            prune: false,
        }),
    };
};

const removeFromCart = async (userId, itemId) => {
    const cart = await getOrCreateActiveCart(userId);

    const beforeCount = cart.items.length;

    cart.items = cart.items.filter((item) => {
        const matchesDirectVariant =
            item.variantId && String(item.variantId) === String(itemId);

        const matchesDirectProduct =
            !item.variantId && String(item.productId) === String(itemId);

        return !(matchesDirectVariant || matchesDirectProduct);
    });

    if (cart.items.length === beforeCount) {
        return {
            success: false,
            status: 404,
            message: "Cart item not found",
        };
    }

    await cart.save();

    return {
        success: true,
        data: await buildCartView(cart),
    };
};

const updateCart = async (userId, data) => {
    const cart = await getOrCreateActiveCart(userId);

    if (data.items) {
        const totals = await calculateCartTotals(
            data.items,
            null,
            0
        );

        if (totals.skippedItems.length > 0) {
            return {
                success: false,
                status: 400,
                message:
                    "Some items in your cart are no longer available and could not be kept.",
                details: totals.skippedItems,
            };
        }

        cart.items = totals.items.map(toStoredItem);
    }

    if (data.removeCoupon) {
        cart.coupon = null;
    } else if (data.couponCode) {
        const result = await findUsableCoupon(data.couponCode);

        if (!result.success) {
            return result;
        }

        cart.coupon = result.data._id;
    }

    await cart.save();

    return {
        success: true,
        data: await buildCartView(cart, {
            prune: false,
        }),
    };
};
const clearCart = async (userId) => {
    await Cart.updateOne(
        { user: userId, status: "active" },
        { $set: { items: [], coupon: null } }
    );

    return { success: true };
};

export {
    getUserCart,
    addToCart,
    removeFromCart,
    updateCart,
    clearCart,
};

export default {
    getUserCart,
    addToCart,
    removeFromCart,
    updateCart,
    clearCart,
};