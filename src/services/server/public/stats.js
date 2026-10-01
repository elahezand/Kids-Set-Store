import Product from "@/model/product";
import { remember, CACHE_KEYS } from "@/utils/cache";
import User from "@/model/user";
import Order from "@/model/order";

// same rule as the shop: only "active" products are public
const PUBLISHED_PRODUCT_FILTER = { status: "active" };

const getStartOfToday = () => {
    const now = new Date();

    return new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
        )
    );
};

// cached for 5 minutes: counts over whole collections
const getPublicStats = async () => remember(CACHE_KEYS.stats, 300, computePublicStats);

const computePublicStats = async () => {
    const [
        activeProducts,
        activeUsers,
        successfulDeals,
        todayProducts,
        ratingRows,
    ] = await Promise.all([
        Product.countDocuments(PUBLISHED_PRODUCT_FILTER),

        User.countDocuments(),

        Order.countDocuments({ status: "completed" }),

        Product.countDocuments({
            ...PUBLISHED_PRODUCT_FILTER,
            createdAt: { $gte: getStartOfToday() },
        }),

        // average score of products that really have reviews
        Product.aggregate([
            {
                $match: {
                    ...PUBLISHED_PRODUCT_FILTER,
                    "metrics.reviewsCount": { $gt: 0 },
                },
            },
            { $group: { _id: null, avg: { $avg: "$metrics.score" } } },
        ]),
    ]);

    const averageRating = ratingRows[0]?.avg
        ? Math.round(ratingRows[0].avg * 10) / 10
        : 0;

    return {
        activeProducts,
        activeUsers,
        successfulDeals,
        todayProducts,
        averageRating,
    };
};

export { getPublicStats };

export default {
    getPublicStats,
};
