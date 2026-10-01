import Favorite from "@/model/favorite";
import Product from "@/model/product";
import { paginate } from "@/utils/helper";

const getUserFavorites = async (userId, query = {}) => {
    const limit = Math.min(
        query.limit ? Number(query.limit) : 21,
        48
    );

    return paginate(Favorite, {
        limit,
        cursor: query.cursor,
        filters: {
            user: userId,
        },
        populate: {
            path: "productId",
            select:
                "title slug price minPrice images variants status metrics shortIdentifier",
        },
        sort: { _id: -1 },
    });
};

const addFavorite = async (userId, productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    const exists = await Favorite.findOne({
        user: userId,
        productId,
    });

    if (exists) {
        return {
            success: false,
            status: 409,
            message: "Already in favorites",
        };
    }

    const favorite = await Favorite.create({
        user: userId,
        productId,
    });

    return {
        success: true,
        data: favorite,
    };
};

const removeFavorite = async (userId, productId) => {
    const favorite = await Favorite.findOneAndDelete({
        user: userId,
        productId,
    });

    if (!favorite) {
        return {
            success: false,
            status: 404,
            message: "Favorite not found",
        };
    }

    return {
        success: true,
    };
};

const toggleFavorite = async (
    userId,
    productId
) => {
    const favorite = await Favorite.findOne({
        user: userId,
        productId,
    });

    if (favorite) {
        await favorite.deleteOne();

        return {
            success: true,
            data: {
                isFavorited: false,
            },
        };
    }

    await Favorite.create({
        user: userId,
        productId,
    });

    return {
        success: true,
        data: {
            isFavorited: true,
        },
    };
};

const isFavorited = async (userId, productId) => {
    const exists = await Favorite.exists({
        user: userId,
        productId,
    });

    return {
        success: true,
        data: {
            isFavorited: !!exists,
        },
    };
};

const getFavoriteCount = async (userId) => {
    const count = await Favorite.countDocuments({
        user: userId,
    });

    return {
        success: true,
        data: {
            count,
        },
    };
};

const checkFavorites = async (userId, productIds) => {
    const idsArray = Array.isArray(productIds)
        ? productIds
        : String(productIds || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

    if (idsArray.length === 0) {
        return {
            success: true,
            data: [],
        };
    }

    const favorites = await Favorite.find({
        user: userId,
        productId: { $in: idsArray },
    })
        .select("productId")
        .lean();

    return {
        success: true,
        data: favorites.map((favorite) =>
            String(favorite.productId)
        ),
    };
};


export {
    getUserFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    checkFavorites,
};

export default {
    getUserFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    checkFavorites,
};
