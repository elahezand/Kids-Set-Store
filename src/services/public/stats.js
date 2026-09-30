import Product from "@/model/product";
import User from "@/model/user";

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

const getPublicStats = async () => {
    const [
        activeProducts,
        activeUsers,
        cityRows,
        successfulDeals,
        todayProducts,
    ] = await Promise.all([
        Product.countDocuments(PUBLISHED_PRODUCT_FILTER),

        User.countDocuments(),

        Product.distinct("location.city", {
            "location.city": { $ne: null },
        }),

        Product.countDocuments({
            "metrics.sold": { $gt: 0 },
        }),

        Product.countDocuments({
            createdAt: { $gte: getStartOfToday() },
        }),
    ]);

    return {
        activeProducts,
        activeUsers,
        citiesCovered: cityRows.length,
        successfulDeals,
        todayProducts,
    };
};

export {
    getPublicStats,
};

export default {
    getPublicStats,
};
