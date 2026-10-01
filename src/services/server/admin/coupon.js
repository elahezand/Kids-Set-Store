import Coupon from "@/model/coupon";
import { paginateList } from "@/utils/listQuery";

const getCoupons = async (query = {}) => {
    const filters = {};

    if (query.isActive !== undefined && query.isActive !== "all") {
        filters.isActive = query.isActive === "true";
    }
    if (query.type && query.type !== "all") {
        filters.type = query.type;
    }

    // ?search= is the old name of ?q=
    return paginateList(Coupon, { ...query, q: query.q ?? query.search }, {
        search: ["code"],
        filters,
    });
};

const getCouponById = async (id) => {
    const coupon =
        await Coupon.findById(id);

    if (!coupon) {
        return {
            success: false,
            status: 404,
            message: "Coupon not found",
        };
    }

    return {
        success: true,
        data: coupon,
    };
};

const createCoupon = async (data) => {
    const code = String(data.code)
        .trim()
        .toUpperCase();

    const existing =
        await Coupon.findOne({ code });

    if (existing) {
        return {
            success: false,
            status: 409,
            message: "Coupon code already exists",
        };
    }

    try {
        const coupon =
            await Coupon.create({
                ...data,
                code,
            });

        return {
            success: true,
            data: coupon,
        };
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message:
                    "Coupon code already exists",
            };
        }

        throw err;
    }
};

const updateCoupon = async (
    id,
    data
) => {
    const current =
        await Coupon.findById(id)
            .select(
                "startsAt expiresAt usedCount"
            )
            .lean();

    if (!current) {
        return {
            success: false,
            status: 404,
            message: "Coupon not found",
        };
    }

    const startsAt =
        data.startsAt !== undefined
            ? data.startsAt
            : current.startsAt;

    const expiresAt =
        data.expiresAt !== undefined
            ? data.expiresAt
            : current.expiresAt;

    if (
        startsAt &&
        expiresAt &&
        new Date(expiresAt) <=
            new Date(startsAt)
    ) {
        return {
            success: false,
            status: 400,
            message:
                "expiresAt must be later than startsAt",
        };
    }

    if (
        data.usageLimit != null &&
        data.usageLimit <
            (current.usedCount || 0)
    ) {
        return {
            success: false,
            status: 400,
            message: `usageLimit can't be below the ${
                current.usedCount || 0
            } uses already made`,
        };
    }

    try {
        const coupon =
            await Coupon.findByIdAndUpdate(
                id,
                data,
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            );

        if (!coupon) {
            return {
                success: false,
                status: 404,
                message: "Coupon not found",
            };
        }

        return {
            success: true,
            data: coupon,
        };
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message:
                    "Coupon code already exists",
            };
        }

        throw err;
    }
};

const deleteCoupon = async (id) => {
    const coupon =
        await Coupon.findByIdAndDelete(id);

    if (!coupon) {
        return {
            success: false,
            status: 404,
            message: "Coupon not found",
        };
    }

    return {
        success: true,
    };
};

export  {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};

export default {
    getCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
};
