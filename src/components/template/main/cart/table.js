"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { TbShoppingCartX } from "react-icons/tb";
import { useQueryClient } from "@tanstack/react-query";
import { useGet, usePost, usePatch, useDelete } from "@/utils/hooks/useReactQuery";
import { formatPrice } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/utils/productView";

/*
  API used here (all services/user/*):
    GET    /user/cart                  -> cart view { items, pricing, coupon, removedItems, couponRemoved }
    PATCH  /user/cart  { items } | { couponCode } | { removeCoupon }
    DELETE /user/cart  { itemId }      (variantId, or productId when the item has no variant)
    POST   /user/order { shippingAddress, paymentMethod, idempotencyKey, useWallet }
                                       -> { order, paymentUrl }
  shippingAddress = model/order shippingAddressSchema
*/

const shippingSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().regex(/^09\d{9}$/, "Enter a valid phone number (09xxxxxxxxx)"),
  state: z.string().trim().min(2, "State is required"),
  city: z.string().trim().min(2, "City is required"),
  address: z.string().trim().min(5, "Address is required"),
  postalCode: z.string().trim().regex(/^\d{5,10}$/, "Postal code must be 5-10 digits"),
  paymentMethod: z.enum(["zarinpal", "cash"]),
  useWallet: z.boolean().optional(),
});

const SHIPPING_FIELDS = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone number", autoComplete: "tel", inputMode: "numeric" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "address", label: "Address", autoComplete: "street-address" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", inputMode: "numeric" },
];

const SKIP_REASONS = {
  out_of_stock: "is out of stock",
  insufficient_stock: "does not have enough stock",
  product_not_found: "no longer exists",
  product_not_available: "is not available any more",
  variant_not_found: "option no longer exists",
  missing_variant_id: "needs an option to be chosen",
  price_not_available: "has no price",
};

const idOf = (value) => (value?._id ? String(value._id) : value ? String(value) : null);

const variantLabel = (snapshot) =>
  Object.entries(snapshot?.attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const Table = ({ initialCart = null, addresses = [], defaultPhone = "", walletBalance = 0 }) => {
  const queryClient = useQueryClient();
  const [discount, setDiscount] = useState("");
  // one key per checkout attempt -> a double click never creates two orders
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);

  const { data: cartResponse, isLoading } = useGet("/user/cart", undefined, {
    queryKey: ["cart"],
    initialData: initialCart ? { success: true, data: initialCart } : undefined,
    staleTime: 0,
  });

  const cart = cartResponse?.data;
  const items = useMemo(() => cart?.items ?? [], [cart]);

  const setCart = (res) => {
    if (res?.data) queryClient.setQueryData(["cart"], { success: true, data: res.data });
  };

  const { mutate: updateCart, isPending: isUpdatingCart } = usePatch("/user/cart", {
    errorFallback: "Could not update cart",
    onSuccess: (res, variables) => {
      setCart(res);
      if (variables?.couponCode) {
        toast.success("Discount code applied");
        setDiscount("");
      }
      if (variables?.removeCoupon) toast.success("Discount code removed");
    },
  });

  const { mutate: removeItem, isPending: isRemoving } = useDelete("/user/cart", {
    errorFallback: "Could not remove product",
    onSuccess: (res) => {
      setCart(res);
      toast.success("Product removed");
    },
  });

  const { mutate: checkout, isPending: isCheckingOut } = usePost("/user/order", {
    errorFallback: "Failed to create order",
    onSuccess: async (res) => {
      const paymentUrl = res?.data?.paymentUrl;
      await queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (paymentUrl) {
        toast.success("Redirecting to the payment gateway...");
        window.location.href = paymentUrl;
        return;
      }

      toast.success("Order placed successfully!");
      window.location.href = "/p-user/orders";
    },
    onError: (error) => {
      setIdempotencyKey(newKey());
      if (error?._authToastShown) return;
      toast.error(error?.response?.data?.message || "Failed to create order");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const firstAddress = addresses[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: firstAddress?.name ?? "",
      phone: defaultPhone,
      state: firstAddress?.state ?? "",
      city: firstAddress?.city ?? "",
      address: firstAddress?.address ?? "",
      postalCode: firstAddress?.postalCode ?? "",
      paymentMethod: "zarinpal",
      useWallet: false,
    },
  });

  const useWallet = watch("useWallet");

  // ---------- Handlers ----------
  const changeQuantity = (item, newQuantity) => {
    if (newQuantity < 1 || isUpdatingCart) return;

    const target = `${idOf(item.productId)}::${idOf(item.variantId) ?? ""}`;

    updateCart({
      items: items.map((current) => {
        const key = `${idOf(current.productId)}::${idOf(current.variantId) ?? ""}`;
        return {
          productId: idOf(current.productId),
          variantId: idOf(current.variantId),
          quantity: key === target ? newQuantity : current.quantity,
        };
      }),
    });
  };

  const applyDiscount = () => {
    const code = discount.trim();
    if (!code) return toast.error("Enter a discount code");
    if (!isUpdatingCart) updateCart({ couponCode: code });
  };

  const onSubmit = ({ paymentMethod, useWallet: payWithWallet, ...shippingAddress }) => {
    if (!items.length) return toast.error("Your cart is empty");

    checkout({
      shippingAddress,
      paymentMethod,
      useWallet: Boolean(payWithWallet),
      idempotencyKey,
    });
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p>Loading cart...</p>
      </div>
    );
  }

  const pricing = cart?.pricing ?? {};
  const walletToUse = useWallet ? Math.min(walletBalance, pricing.total ?? 0) : 0;
  const payable = Math.max((pricing.total ?? 0) - walletToUse, 0);

  return (
    <>
      <div className="w-full flex-1">
        {(cart?.removedItems?.length > 0 || cart?.couponRemoved) && (
          <div role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            {cart.removedItems?.map((removed, index) => (
              <p key={index}>
                An item {SKIP_REASONS[removed.reason] ?? "was not available"} and was removed from your cart.
              </p>
            ))}
            {cart.couponRemoved && <p>Your discount code was removed: {cart.couponRemoved}.</p>}
          </div>
        )}

        {items.length ? (
          <>
            <div className="w-full overflow-x-auto rounded-2xl shadow-card">
              <table className="w-full min-w-[640px] border-collapse bg-white text-text dark:bg-ink-800 dark:text-gray-100">
                <thead>
                  <tr>
                    {["Product", "Price", "Quantity", "Total", ""].map((title, index) => (
                      <th
                        key={title || `actions-${index}`}
                        className="bg-sage-400 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const productId = idOf(item.productId);
                    const variantId = idOf(item.variantId);
                    const price = Number(item.finalPrice ?? item.price ?? 0);
                    const title = item.productId?.title || "Product";
                    const image = item.productId?.images?.[0] || PLACEHOLDER_IMAGE;
                    const options = variantLabel(item.variantSnapshot);

                    return (
                      <tr key={`${productId}-${variantId || "no-variant"}`}>
                        <td className="w-[260px] border-b border-gray-200 p-4 text-left align-middle dark:border-white/10">
                          <div className="flex items-center gap-4">
                            <Image
                              width={80}
                              height={80}
                              src={image}
                              alt={title}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/products/${productId}`}
                                className="text-sm font-medium leading-6 text-text hover:text-coral-300 dark:text-gray-100"
                              >
                                {title}
                              </Link>
                              {options && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">{options}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">
                          {formatPrice(price)}
                        </td>

                        <td className="min-w-[160px] border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          <div className="mx-auto flex w-[110px] items-center justify-between overflow-hidden rounded-lg border-2 border-coral-300">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => changeQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdatingCart}
                              className="flex-1 select-none bg-gray-50 py-1 transition-colors hover:bg-coral-300 hover:text-white disabled:opacity-40 dark:bg-ink-800"
                            >
                              -
                            </button>
                            <span className="px-2" aria-live="polite">{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => changeQuantity(item, item.quantity + 1)}
                              disabled={isUpdatingCart}
                              className="flex-1 select-none bg-gray-50 py-1 transition-colors hover:bg-coral-300 hover:text-white disabled:opacity-40 dark:bg-ink-800"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          {formatPrice(item.quantity * price)}
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => !isRemoving && removeItem({ itemId: variantId || productId })}
                            disabled={isRemoving}
                            aria-label={`Remove ${title} from cart`}
                          >
                            <IoMdClose className="text-2xl text-danger-500 transition-transform hover:scale-125" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <section className="mt-6 flex flex-wrap items-center justify-end gap-4">
              {cart?.coupon ? (
                <div className="flex items-center gap-3 rounded-lg border border-sage-400 px-4 py-2 text-sm">
                  <span>
                    Code <strong>{cart.coupon.code}</strong> applied
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCart({ removeCoupon: true })}
                    disabled={isUpdatingCart}
                    className="text-danger-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex h-11 items-center overflow-hidden rounded-lg border border-coral-300">
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyDiscount();
                    }}
                    placeholder="Discount code"
                    aria-label="Discount code"
                    className="h-full w-[140px] border-none bg-transparent px-4 text-sm uppercase outline-none sm:w-[180px]"
                  />
                  <button
                    type="button"
                    onClick={applyDiscount}
                    disabled={isUpdatingCart}
                    className="h-full whitespace-nowrap bg-coral-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-coral-400 disabled:opacity-60 sm:px-5"
                  >
                    {isUpdatingCart ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="card card-body py-16 text-center">
            <TbShoppingCartX className="mx-auto mb-4 text-[6rem] text-gray-300 dark:text-gray-600 sm:text-[8rem]" />
            <p className="mb-4 text-2xl font-bold sm:text-[32px]">Your cart is empty</p>
            <Link href="/products" className="btn btn-accent mx-auto w-max">
              Go to store
            </Link>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="card card-body w-full lg:w-[380px] lg:shrink-0">
          <p className="mb-4 text-lg font-bold uppercase sm:text-xl">Checkout</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-3.5" noValidate>
            {addresses.length > 1 && (
              <select
                aria-label="Saved addresses"
                className="input w-full"
                defaultValue="0"
                onChange={(e) => {
                  const picked = addresses[Number(e.target.value)];
                  if (picked) reset({ ...picked, phone: watch("phone"), paymentMethod: watch("paymentMethod"), useWallet });
                }}
              >
                {addresses.map((address, index) => (
                  <option key={index} value={index}>
                    {address.name} — {address.city}
                  </option>
                ))}
              </select>
            )}

            <div className="flex flex-col gap-2">
              {SHIPPING_FIELDS.map(({ name, label, ...rest }) => (
                <div key={name}>
                  <input
                    {...register(name)}
                    {...rest}
                    placeholder={label}
                    aria-label={label}
                    aria-invalid={Boolean(errors[name])}
                    className={`input w-full ${errors[name] ? "input-error" : ""}`}
                  />
                  {errors[name] && (
                    <p className="mt-1 text-xs text-danger-500">{errors[name].message}</p>
                  )}
                </div>
              ))}
            </div>

            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-1 font-semibold">Payment method</legend>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" value="zarinpal" {...register("paymentMethod")} />
                Online payment (ZarinPal)
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="radio" value="cash" {...register("paymentMethod")} />
                Cash on delivery
              </label>
            </fieldset>

            {walletBalance > 0 && (
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="checkbox" {...register("useWallet")} />
                Use wallet balance ({formatPrice(walletBalance)})
              </label>
            )}

            <div className="mt-2 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
              <div className="flex items-center justify-between">
                <p>Subtotal</p>
                <p>{formatPrice(pricing.subtotal)}</p>
              </div>
              {pricing.discount > 0 && (
                <div className="flex items-center justify-between">
                  <p>Discount</p>
                  <p className="text-danger-500">- {formatPrice(pricing.discount)}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p>Shipping</p>
                <p>{pricing.shippingCost > 0 ? formatPrice(pricing.shippingCost) : "Free"}</p>
              </div>
              {walletToUse > 0 && (
                <div className="flex items-center justify-between">
                  <p>Wallet</p>
                  <p className="text-danger-500">- {formatPrice(walletToUse)}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p>Total</p>
                <p className="text-xl font-bold text-sage-500">{formatPrice(payable)}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!items.length || isCheckingOut || isUpdatingCart}
              className="btn btn-accent w-full disabled:opacity-60"
            >
              {isCheckingOut ? "Processing..." : "Place order"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Table;
