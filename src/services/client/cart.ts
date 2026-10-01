"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutFormSchema } from "@/validators/order";
import { toast } from "sonner";
import type {
  AddToCartPayload,
  ApiSuccess,
  CartItem,
  CartItemInput,
  CartPricing,
  CartSkipReason,
  CartView,
  CheckoutFormValues,
  CheckoutPayload,
  CheckoutResult,
  RemoveCartItemPayload,
  SavedAddress,
  UpdateCartPayload,
} from "@/types";
import { queryKeys } from "./keys";
import { useDelete, useGet, usePatch, usePost } from "./query";
import { showErrorToast } from "./errors";


type CartResponse = ApiSuccess<CartView>;

/** put the cart a mutation returned straight into the cache (no refetch) */
const useSetCart = () => {
  const queryClient = useQueryClient();
  return (response?: CartResponse) => {
    if (response?.data) queryClient.setQueryData<CartResponse>(queryKeys.cart, response);
  };
};

export const useCart = ({
  enabled = true,
  initialCart,
  silent = false,
}: { enabled?: boolean; initialCart?: CartView | null; silent?: boolean } = {}) =>
  useGet<CartResponse>("/user/cart", undefined, {
    queryKey: queryKeys.cart,
    enabled,
    retry: false,
    silentError: silent,
    axiosConfig: silent ? { silentAuth: true } : undefined,
    initialData: initialCart ? { success: true, data: initialCart } : undefined,
    staleTime: 30 * 1000,
  });

/** pieces in the cart (badge) */
export const countCartItems = (cart?: CartView | null) =>
  (cart?.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

export const useAddToCart = ({ notify = true }: { notify?: boolean } = {}) => {
  const setCart = useSetCart();

  return usePost<CartResponse, AddToCartPayload>("/user/cart", {
    errorFallback: "Could not add to cart",
    onSuccess: (response) => {
      setCart(response);
      if (notify) toast.success("Added to cart");
    },
  });
};

export const useUpdateCart = () => {
  const setCart = useSetCart();

  return usePatch<CartResponse, UpdateCartPayload>("/user/cart", {
    errorFallback: "Could not update cart",
    onSuccess: (response, variables) => {
      setCart(response);
      if ("couponCode" in variables) toast.success("Discount code applied");
      if ("removeCoupon" in variables) toast.success("Discount code removed");
    },
  });
};

export const useRemoveCartItem = () => {
  const setCart = useSetCart();

  return useDelete<CartResponse, RemoveCartItemPayload>("/user/cart", {
    errorFallback: "Could not remove product",
    onSuccess: (response) => {
      setCart(response);
      toast.success("Product removed");
    },
  });
};


export const useCheckout = ({ onFailed }: { onFailed?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return usePost<ApiSuccess<CheckoutResult>, CheckoutPayload>("/user/order", {
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cart });

      const paymentUrl = response.data?.paymentUrl;
      if (paymentUrl) {
        toast.success("Redirecting to the payment gateway...");
        window.location.href = paymentUrl;
        return;
      }

      toast.success("Order placed successfully!");
      window.location.href = "/p-user/orders";
    },
    onError: (error) => {
      onFailed?.();
      showErrorToast(error, "Failed to create order");
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};


/* ---------- checkout form state (cart page) ---------- */

const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** one key per checkout attempt -> a double click never creates two orders */
export const useIdempotencyKey = () => {
  const [key, setKey] = useState<string>(newIdempotencyKey);
  return { key, renew: () => setKey(newIdempotencyKey()) };
};

/** what the buyer will pay after the optional wallet part */
export const getPayable = (pricing: CartPricing | undefined, walletBalance: number, useWallet: boolean) => {
  const total = pricing?.total ?? 0;
  const walletToUse = useWallet ? Math.min(walletBalance, total) : 0;
  return { walletToUse, payable: Math.max(total - walletToUse, 0) };
};

/** body for useUpdateCart when one line changes quantity */
export const withQuantity = (items: CartItem[], target: CartItem, quantity: number): CartItemInput[] => {
  const key = (item: CartItem) => `${item.productId?._id ?? item.productId}::${item.variantId ?? ""}`;
  const targetKey = key(target);

  return items.map((item) => ({
    productId: String(item.productId?._id ?? item.productId),
    variantId: item.variantId ?? null,
    quantity: key(item) === targetKey ? quantity : item.quantity,
  }));
};

/** id DELETE /user/cart expects: variantId, or productId for products without variants */
export const cartItemId = (item: CartItem) => String(item.variantId || item.productId?._id || item.productId);

export const CART_SKIP_MESSAGES: Record<CartSkipReason, string> = {
  out_of_stock: "is out of stock",
  insufficient_stock: "does not have enough stock",
  product_not_found: "no longer exists",
  product_not_available: "is not available any more",
  variant_not_found: "option no longer exists",
  missing_variant_id: "needs an option to be chosen",
  missing_product_id: "is missing",
  price_not_available: "has no price",
};
