import Coupon from "@/model/coupon";

const validateCoupon = async (code) => {
    const coupon = await Coupon.findOne({
        code: String(code).trim().toUpperCase(),
    });

    if (!coupon) {
        return {
            success: false,
            status: 404,
            message: "Coupon not found",
        };
    }

    const now = new Date();

    if (!coupon.isActive) {
        return {
            success: false,
            status: 400,
            message: "Coupon is inactive",
        };
    }

    if (coupon.startsAt && coupon.startsAt > now) {
        return {
            success: false,
            status: 400,
            message: "Coupon has not started yet",
        };
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
        return {
            success: false,
            status: 400,
            message: "Coupon has expired",
        };
    }

    if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
    ) {
        return {
            success: false,
            status: 400,
            message: "Coupon usage limit reached",
        };
    }

    return {
        success: true,
        data: coupon,
    };
};

export {
    validateCoupon,
};

export default {
    validateCoupon,
};
