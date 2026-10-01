import Cart from "@/model/cart";
import { paginateList } from "@/utils/listQuery";


import { buildCartView } from "@/services/server/shared/cart";

const getAdminCarts = async (query = {}) =>
    paginateList(Cart, query, {
        defaultLimit: 15,
        statuses: ["active", "abandoned", "converted"],
        ids: { user: "user" },
        populate: [
            { path: "user", select: "username phone email" },
            { path: "items.productId", select: "title images" },
        ],
    });

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

export default {
    getAdminCarts,
    getCartById,
    deleteCart,
};
