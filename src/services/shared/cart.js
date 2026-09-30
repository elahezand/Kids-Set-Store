import Coupon from "@/model/coupon";
import { calculateCartTotals } from "@/utils/helper";

const toStoredItem = (item) => ({
    productId: item.productId,
    variantId: item.variantId || null,
    quantity: item.quantity,
});

const toViewItem = (item) => ({
    productId: item.productInfo,
    variantId: item.variantId,
    variantSnapshot: item.variantSnapshot,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount,
    finalPrice: item.finalPrice,
});

const getCouponProblem = (couponDoc) => {
    if (!couponDoc) {
        return "Coupon not found";
    }

    const now = new Date();

    if (!couponDoc.isActive) {
        return "Coupon is inactive";
    }

    if (couponDoc.startsAt && couponDoc.startsAt > now) {
        return "Coupon has not started yet";
    }

    if (couponDoc.expiresAt && couponDoc.expiresAt < now) {
        return "Coupon has expired";
    }

    if (
        couponDoc.usageLimit != null &&
        couponDoc.usedCount >= couponDoc.usageLimit
    ) {
        return "Coupon usage limit reached";
    }

    return null;
};

const buildCartView = async (
    cart,
    { prune = true } = {}
) => {
    let couponDoc = cart.coupon
        ? await Coupon.findById(cart.coupon)
        : null;

    let couponRemoved = null;

    if (cart.coupon && getCouponProblem(couponDoc)) {
        couponRemoved = getCouponProblem(couponDoc);
        couponDoc = null;
    }

    const totals = await calculateCartTotals(
        cart.items,
        couponDoc,
        cart.shippingCost || 0
    );

    if (
        prune &&
        (totals.skippedItems.length > 0 || couponRemoved)
    ) {
        cart.items = totals.items.map(toStoredItem);

        if (couponRemoved) {
            cart.coupon = null;
        }

        await cart.save();
    }

    const base =
        typeof cart.toJSON === "function"
            ? cart.toJSON()
            : { ...cart };

    return {
        ...base,
        items: totals.items.map(toViewItem),
        coupon: couponDoc
            ? {
                  _id: couponDoc._id,
                  code: couponDoc.code,
              }
            : null,
        pricing: totals.pricing,
        removedItems: totals.skippedItems,
        couponRemoved,
    };
};

export {
    toStoredItem,
    getCouponProblem,
    buildCartView,
};

export default {
    toStoredItem,
    getCouponProblem,
    buildCartView,
};
