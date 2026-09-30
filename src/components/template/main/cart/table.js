"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { TbShoppingCartX } from "react-icons/tb";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGet,
  usePost,
  usePatch,
  useDelete,
} from "@/utils/hooks/useReactQuery";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

const shippingFields = [
  { name: "fullName", label: "Full name" },
  { name: "phone", label: "Phone number" },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  { name: "postalCode", label: "Postal code" },
];

const idOf = (value) => value?._id || value || null;

const Table = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [discount, setDiscount] = useState("");

  const refreshCart = () =>
    queryClient.refetchQueries({ queryKey: ["cart"] });

  // ---------- Get cart ----------
  const { data: cartResponse, isLoading } = useGet("/user/cart", undefined, {
    queryKey: ["cart"],
  });
  const cart = cartResponse?.data;
  const items = cart?.items || [];

  // ---------- Update cart (quantity / coupon) ----------
  const { mutate: updateCart, isPending: isUpdatingCart } = usePatch(
    "/user/cart",
    {
      onSuccess: async (_res, variables) => {
        if (variables?.couponCode) {
          toast.success("Discount code applied");
          setDiscount("");
        }
        await refreshCart();
      },
      errorFallback: "Could not update cart",
    }
  );

  // ---------- Remove item ----------
  const { mutate: removeItem, isPending: isRemoving } = useDelete(
    "/user/cart",
    {
      onSuccess: async () => {
        toast.success("Product removed");
        await refreshCart();
      },
      errorFallback: "Could not remove product",
    }
  );

  // ---------- Create order ----------
  const { mutate: createOrder, isPending: isCreatingOrder } = usePost(
    "/orders",
    {
      errorFallback: "Failed to create order",
      onSuccess: async () => {
        toast.success("Order created successfully!");

        await refreshCart();
        await queryClient.invalidateQueries({ queryKey: ["/orders"] });

        router.push("/orders");
      },
    }
  );

  // ---------- Shipping form ----------
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  // ---------- Handlers ----------
  const changeQuantity = (item, newQuantity) => {
    if (newQuantity < 1 || isUpdatingCart) return;

    const targetProduct = String(idOf(item.productId));
    const targetVariant = String(idOf(item.variantId) || "");

    const updatedItems = items.map((current) => {
      const productId = idOf(current.productId);
      const variantId = idOf(current.variantId);

      const isTarget =
        String(productId) === targetProduct &&
        String(variantId || "") === targetVariant;

      return {
        productId,
        variantId,
        quantity: isTarget ? newQuantity : current.quantity,
      };
    });

    console.log("UPDATED ITEMS:", updatedItems);

    updateCart({ items: updatedItems });
  };

  const discountHandler = () => {
    const code = discount.trim();

    if (!code) {
      toast.error("Enter discount code");
      return;
    }

    if (isUpdatingCart) return;

    updateCart({ couponCode: code });
  };

  const removeFromCart = (item) => {
    if (isRemoving) return;

    const itemId = idOf(item.variantId) || idOf(item.productId);

    removeItem({ itemId });
  };

  const onSubmit = (shippingData) => {
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    createOrder({
      ...shippingData,
      items: items.map((item) => ({
        productId: idOf(item.productId),
        variantId: idOf(item.variantId),
        quantity: item.quantity,
      })),
    });
  };

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p>Loading cart...</p>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <>
      <div className="w-full flex-1">
        {items.length ? (
          <>
            <div className="w-full overflow-x-auto rounded-2xl shadow-card">
              <table className="w-full min-w-[640px] border-collapse bg-white text-text dark:bg-ink-800 dark:text-gray-100">
                <thead>
                  <tr>
                    {["Product", "Price", "Number", "Total", ""].map(
                      (title, index) => (
                        <th
                          key={title || `actions-${index}`}
                          className="bg-sage-400 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white"
                        >
                          {title}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => {
                    const price = Number(item.finalPrice ?? item.price ?? 0);
                    const productId = idOf(item.productId);
                    const variantId = idOf(item.variantId);

                    const productTitle =
                      item.productInfo?.title ||
                      item.productId?.title ||
                      "Product";

                    const productImage =
                      item.productInfo?.images?.[0] ||
                      item.productId?.images?.[0];

                    return (
                      <tr key={`${productId}-${variantId || "no-variant"}`}>
                        <td className="w-[250px] border-b border-gray-200 p-4 text-left align-middle dark:border-white/10">
                          <div className="flex items-center gap-4">
                            {productImage ? (
                              <Image
                                width={80}
                                height={80}
                                src={productImage}
                                alt={productTitle}
                                className="h-20 w-20 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-xl bg-gray-100 dark:bg-ink-700" />
                            )}

                            <Link
                              href={`/product/${productId}`}
                              className="text-sm font-medium leading-6 text-text dark:text-gray-100"
                            >
                              {productTitle}
                            </Link>
                          </div>
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle text-sm font-semibold !text-gray-500 dark:border-white/10 dark:text-gray-400">
                          {price.toLocaleString()} $
                        </td>

                        <td className="min-w-[180px] border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          <div className="mx-auto flex w-[100px] items-center justify-between overflow-hidden rounded-lg border-2 border-coral-300">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || isUpdatingCart}
                              className="flex-1 select-none bg-gray-50 py-1 text-center transition-colors hover:bg-coral-300 hover:text-white disabled:opacity-40 dark:bg-ink-800"
                            >
                              -
                            </button>

                            <span className="px-2">{item.quantity}</span>

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item, item.quantity + 1)
                              }
                              disabled={isUpdatingCart}
                              className="flex-1 select-none bg-gray-50 py-1 text-center transition-colors hover:bg-coral-300 hover:text-white disabled:opacity-40 dark:bg-ink-800"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          {(item.quantity * price).toLocaleString()} $
                        </td>

                        <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item)}
                            disabled={isRemoving}
                            aria-label="Remove from cart"
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
              <div className="flex h-11 items-center overflow-hidden rounded-lg border border-coral-300">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") discountHandler();
                  }}
                  placeholder="Discount code"
                  className="h-full w-[140px] border-none bg-transparent px-4 text-sm outline-none sm:w-[180px]"
                />

                <button
                  type="button"
                  onClick={discountHandler}
                  disabled={isUpdatingCart}
                  className="h-full whitespace-nowrap bg-coral-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-coral-400 disabled:opacity-60 sm:px-5"
                >
                  {isUpdatingCart ? "Applying..." : "Submit"}
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className="card card-body py-16 text-center">
            <TbShoppingCartX className="mx-auto mb-4 text-[6rem] text-gray-300 dark:text-gray-600 sm:text-[8rem]" />

            <p className="mb-4 text-2xl font-bold sm:text-[32px]">
              No Product yet
            </p>

            <Link href="/category" className="btn btn-accent">
              Go To Store
            </Link>
          </div>
        )}
      </div>

      <div className="card card-body w-full lg:w-[380px] lg:shrink-0">
        <p className="mb-4 text-lg font-bold uppercase sm:text-xl">
          Cart Total
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-3.5"
        >
          <div className="flex flex-col gap-2">
            {shippingFields.map(({ name, label }) => (
              <div key={name}>
                <input
                  {...formRegister(name)}
                  placeholder={label}
                  aria-label={label}
                  className={`input w-full ${errors[name] ? "input-error" : ""
                    }`}
                />

                {errors[name] && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors[name].message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-white/10">
            <div className="flex items-center justify-between">
              <p>Subtotal</p>
              <p>{(cart?.pricing?.subtotal ?? 0).toLocaleString()} $</p>
            </div>

            <div className="flex items-center justify-between">
              <p>Discount</p>
              <p className="text-danger-500">
                - {(cart?.pricing?.discount ?? 0).toLocaleString()} $
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p>Total</p>
              <p className="text-xl font-bold text-sage-500">
                {(cart?.pricing?.total ?? 0).toLocaleString()} $
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!items.length || isCreatingOrder}
            className="btn btn-accent w-full disabled:opacity-60"
          >
            {isCreatingOrder ? "Processing..." : "Proceed to Checkout"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Table;