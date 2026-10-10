"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { IoMdClose } from "react-icons/io";
import { TbShoppingCartX } from "react-icons/tb";
import {
  CART_SKIP_MESSAGES,
  cartItemId,
  getPayable,
  useCart,
  useCheckout,
  useIdempotencyKey,
  useRemoveCartItem,
  useUpdateCart,
  withQuantity,
} from "@/services/client/cart";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { checkoutFormSchema } from "@/validators/order";
import type { CartItem, CartView, CheckoutFormValues, SavedAddress, ShippingAddress } from "@/types";

const SHIPPING_FIELDS: Array<{
  name: keyof ShippingAddress;
  label: string;
  autoComplete: string;
  inputMode?: "numeric";
}> = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone number", autoComplete: "tel", inputMode: "numeric" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "address", label: "Address", autoComplete: "street-address" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code", inputMode: "numeric" },
];

const variantLabel = (item: CartItem) =>
  Object.entries(item.variantSnapshot?.attributes ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");

interface CartTableProps {
  initialCart: CartView | null;
  addresses?: SavedAddress[];
  defaultPhone?: string;
  walletBalance?: number;
}

const CartTable = ({ initialCart, addresses = [], defaultPhone = "", walletBalance = 0 }: CartTableProps) => {
  const [discount, setDiscount] = useState("");
  const idempotency = useIdempotencyKey();

  const { data: cartResponse, isLoading } = useCart({ initialCart });
  const updateCart = useUpdateCart();
  const removeItem = useRemoveCartItem();
  const checkout = useCheckout({ onFailed: idempotency.renew });

  const cart = cartResponse?.data;
  const items = cart?.items ?? [];
  const pricing = cart?.pricing;
  const first = addresses[0];

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: first?.name ?? "",
      phone: defaultPhone,
      state: first?.state ?? "",
      city: first?.city ?? "",
      address: first?.address ?? "",
      postalCode: first?.postalCode ?? "",
      paymentMethod: "zarinpal",
      useWallet: false,
    },
  });

  const { walletToUse, payable } = getPayable(pricing, walletBalance, Boolean(watch("useWallet")));

  const changeQuantity = (item: CartItem, quantity: number) => {
    if (quantity < 1 || updateCart.isPending) return;
    updateCart.mutate({ items: withQuantity(items, item, quantity) });
  };

  const applyDiscount = () => {
    const code = discount.trim();
    if (!code) return toast.error("Enter a discount code");
    if (!updateCart.isPending) {
      updateCart.mutate({ couponCode: code }, { onSuccess: () => setDiscount("") });
    }
  };

  const onSubmit = ({ paymentMethod, useWallet, ...shippingAddress }: CheckoutFormValues) => {
    if (!items.length) return toast.error("Your cart is empty");
    checkout.mutate({
      shippingAddress,
      paymentMethod,
      useWallet: Boolean(useWallet),
      idempotencyKey: idempotency.key,
    });
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex-1">
        {(Boolean(cart?.removedItems?.length) || cart?.couponRemoved) && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
          >
            {cart?.removedItems?.map((removed, index) => (
              <p key={index}>
                An item {CART_SKIP_MESSAGES[removed.reason] ?? "was not available"} and was removed from your cart.
              </p>
            ))}
            {cart?.couponRemoved && <p>Your discount code was removed: {cart.couponRemoved}.</p>}
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
                        className="bg-brand-400 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const productId = String(item.productId?._id ?? item.productId);
                    const price = Number(item.finalPrice ?? item.price ?? 0);
                    const title = item.productId?.title || "Product";
                    const image = item.productId?.images?.[0] || PLACEHOLDER_IMAGE;
                    const options = variantLabel(item);

                    return (
                      <tr key={`${productId}-${item.variantId || "no-variant"}`}>
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
                                href={ROUTES.product(productId)}
                                className="text-sm font-medium leading-6 text-text hover:text-brand-600 dark:text-gray-100"
                              >
                                {title}
                              </Link>
                              {options && <span className="text-xs text-gray-500 dark:text-gray-400">{options}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle text-sm font-semibold text-gray-500 dark:border-white/10 dark:text-gray-400">
                          {formatPrice(price)}
                        </td>

                        <td className="min-w-[160px] border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          <div className="mx-auto flex w-[110px] items-center justify-between overflow-hidden rounded-lg border-2 border-gray-200">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => changeQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updateCart.isPending}
                              className="flex-1 select-none bg-gray-50 py-1 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 dark:bg-ink-800"
                            >
                              -
                            </button>
                            <span className="px-2" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => changeQuantity(item, item.quantity + 1)}
                              disabled={updateCart.isPending}
                              className="flex-1 select-none bg-gray-50 py-1 transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 dark:bg-ink-800"
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
                            onClick={() => !removeItem.isPending && removeItem.mutate({ itemId: cartItemId(item) })}
                            disabled={removeItem.isPending}
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
                <div className="flex items-center gap-3 rounded-lg border border-brand-400 px-4 py-2 text-sm">
                  <span>
                    Code <strong>{cart.coupon.code}</strong> applied
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCart.mutate({ removeCoupon: true })}
                    disabled={updateCart.isPending}
                    className="text-danger-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex h-11 items-center overflow-hidden rounded-lg border border-gray-300">
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
                    disabled={updateCart.isPending}
                    className="h-full whitespace-nowrap bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 sm:px-5"
                  >
                    {updateCart.isPending ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="card card-body py-16 text-center">
            <TbShoppingCartX className="mx-auto mb-4 text-[6rem] text-gray-300 dark:text-gray-600 sm:text-[8rem]" />
            <p className="mb-4 text-2xl font-bold sm:text-[32px]">Your cart is empty</p>
            <Link href={ROUTES.products} className="btn btn-accent mx-auto w-max">
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
                  if (picked) reset({ ...getValues(), ...picked });
                }}
              >
                {addresses.map((address, index) => (
                  <option key={index} value={index}>
                    {address.name} - {address.city}
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
                  {errors[name] && <p className="mt-1 text-xs text-danger-500">{errors[name]?.message}</p>}
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
                <p>{formatPrice(pricing?.subtotal)}</p>
              </div>
              {(pricing?.discount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <p>Discount</p>
                  <p className="text-danger-500">- {formatPrice(pricing?.discount)}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p>Shipping</p>
                <p>{(pricing?.shippingCost ?? 0) > 0 ? formatPrice(pricing?.shippingCost) : "Free"}</p>
              </div>
              {walletToUse > 0 && (
                <div className="flex items-center justify-between">
                  <p>Wallet</p>
                  <p className="text-danger-500">- {formatPrice(walletToUse)}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p>Total</p>
                <p className="text-xl font-bold text-brand-500">{formatPrice(payable)}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!items.length || checkout.isPending || updateCart.isPending}
              className="btn btn-accent w-full disabled:opacity-60"
            >
              {checkout.isPending ? "Processing..." : "Place order"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CartTable;
