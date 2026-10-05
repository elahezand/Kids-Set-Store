import Favorite from "@/model/favorite";
import { paginateList } from "@/utils/listQuery";
import "@/model/product"; // registers the Product model for populate("productId")

const getUserFavorites = async (userId, query = {}) =>
    paginateList(Favorite, query, {
        defaultLimit: 20,
        maxLimit: 48,
        base: { user: userId },
        populate: {
            path: "productId",
            select: "title slug price minPrice images variants status metrics shortIdentifier",
        },
    });

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

const FAVORITE_IDS_LIMIT = 1000;

const getFavoriteIds = async (userId) => {
    const favorites = await Favorite.find({ user: userId })
        .sort({ _id: -1 })
        .limit(FAVORITE_IDS_LIMIT)
        .select("productId")
        .lean();

    return {
        success: true,
        data: favorites.map((favorite) => String(favorite.productId)),
    };
};

export {
    getUserFavorites,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    getFavoriteIds,
};

export default {
    getUserFavorites,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    getFavoriteIds,
};
