import Cart from "@/model/cart";

import { paginate } from "@/utils/paginate";

import { buildCartView } from "@/services/shared/cart";

const getAdminCarts = async (query = {}) => {
    const limit = Math.min(Number(query.limit) || 15, 100);

    return paginate(Cart, {
        limit,
        cursor: query.cursor,
        populate: "user items.productId",
        sort: {
            _id: -1,
        },
    });
};

const getCartById = async (id) => {
    const cart = await Cart.findById(id).populate(
        "user",
        "name email phone"
    );

    if (!cart) {
        return {
            success: false,
            status: 404,
            message: "Cart not found",
        };
    }

    const data = buildCartView(cart, {
        prune: false,
    });

    return {
        success: true,
        data,
    };
};

const deleteCart = async (id) => {
    const cart = await Cart.findByIdAndDelete(id);

    if (!cart) {
        return {
            success: false,
            status: 404,
            message: "Cart not found",
        };
    }

    return {
        success: true,
    };
};

export  {
    getAdminCarts,
    getCartById,
    deleteCart,
};