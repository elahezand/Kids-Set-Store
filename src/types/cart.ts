import type { Id } from "./api";
import type { VariantAttributes } from "./product";

export interface CartProductInfo {
  _id: Id;
  title: string;
  slug: string | null;
  images: string[];
}

export interface CartVariantSnapshot {
  attributes: VariantAttributes | null;
  sku: string | null;
}

export interface CartItem {
  productId: CartProductInfo;
  variantId: Id | null;
  variantSnapshot: CartVariantSnapshot | null;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
}

export interface CartPricing {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

export type CartSkipReason =
  | "out_of_stock"
  | "insufficient_stock"
  | "product_not_found"
  | "product_not_available"
  | "variant_not_found"
  | "missing_variant_id"
  | "missing_product_id"
  | "price_not_available";

export interface CartRemovedItem {
  productId?: Id;
  variantId?: Id | null;
  reason: CartSkipReason;
  stock?: number;
  requested?: number;
}

export interface CartView {
  id?: Id;
  user?: Id;
  status?: "active" | "abandoned" | "converted";
  items: CartItem[];
  coupon: { _id: Id; code: string } | null;
  pricing: CartPricing;
  removedItems: CartRemovedItem[];
  couponRemoved: string | null;
}

export interface CartItemInput {
  productId: Id;
  variantId: Id | null;
  quantity: number;
}

export interface AddToCartPayload {
  items: CartItemInput[];
}

export type UpdateCartPayload = { items: CartItemInput[] } | { couponCode: string } | { removeCoupon: true };

export interface RemoveCartItemPayload {
  itemId: Id;
}
