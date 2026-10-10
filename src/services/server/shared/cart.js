import Coupon from "@/model/coupon";
import Order from "@/model/order";
import { calculateCartTotals, getCouponProblem } from "@/utils/helper";

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

const getCouponProblemForUser = async (couponDoc, userId, subtotal) => {
  const problem = getCouponProblem(couponDoc, { subtotal });
  if (problem) return problem;

  if (couponDoc.perUserLimit != null) {
    const used = await Order.countDocuments({
      user: userId,
      "coupon.couponId": couponDoc._id,
      status: { $ne: "cancelled" },
    });
    if (used >= couponDoc.perUserLimit) return "You have already used this coupon";
  }

  return null;
};

const buildCartView = async (cart, { prune = true } = {}) => {
  let couponDoc = cart.coupon ? await Coupon.findById(cart.coupon) : null;

  let couponRemoved = null;

  if (cart.coupon && getCouponProblem(couponDoc)) {
    couponRemoved = getCouponProblem(couponDoc);
    couponDoc = null;
  }

  const totals = await calculateCartTotals(cart.items, couponDoc);

  if (prune && (totals.skippedItems.length > 0 || couponRemoved)) {
    cart.items = totals.items.map(toStoredItem);

    if (couponRemoved) {
      cart.coupon = null;
    }

    await cart.save();
  }

  const base = typeof cart.toJSON === "function" ? cart.toJSON() : { ...cart };

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

export { toStoredItem, getCouponProblem, getCouponProblemForUser, buildCartView };

export default {
  toStoredItem,
  getCouponProblem,
  getCouponProblemForUser,
  buildCartView,
};
