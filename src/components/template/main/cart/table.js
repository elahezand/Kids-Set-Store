"use client";

import useShop from "@/utils/hooks/useCard";
import { useState, useMemo } from "react";
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
import { usePost } from "@/utils/hooks/useReactQuery";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

const shippingFields = ["fullName", "phone", "address", "city", "postalCode"];

const Table = () => {
  const { removeFromCart, cart, increaseCount, decreaseCount } = useShop();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [discount, setDiscount] = useState("");
  const [discountData, setDiscountData] = useState(null);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.count, 0);
  }, [cart]);

  const discountedTotal = useMemo(() => {
    if (!discountData) return total;

    return cart.reduce((sum, item) => {
      if (item._id === discountData.productId) {
        const discountedPrice = item.price * (1 - discountData.percent / 100);
        return sum + discountedPrice * item.count;
      }

      return sum + item.price * item.count;
    }, 0);
  }, [cart, discountData, total]);

  // Apply discount
  const { mutate: applyDiscount, isPending: isApplyingDiscount } = usePost(
    "/discount/use",
    {
      errorFallback: "Invalid discount code",

      onSuccess: (data) => {
        setDiscountData({
          productId: data.productId,
          percent: data.percent,
        });

        toast.success("Discount applied!");
      },
    }
  );

  const discountHandler = () => {
    const code = discount.trim();

    if (!code) {
      toast.error("Enter discount code");
      return;
    }

    if (isApplyingDiscount) return;

    applyDiscount({ code });
  };

  // Create order
  const { mutate: createOrder, isPending: isCreatingOrder } = usePost(
    "/orders",
    {
      errorFallback: "Failed to create order",

      onSuccess: () => {
        toast.success("Order created successfully!");
        localStorage.removeItem("cart");
        queryClient.invalidateQueries({ queryKey: ["/orders"] });
        router.push("/orders");
      },
    }
  );

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

  // Submit order
  const onSubmit = (shippingData) => {
    if (!cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      ...shippingData,

      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.count,
        price: item.price,
      })),

      total: discountedTotal,

      ...(discountData && {
        discount: {
          productId: discountData.productId,
          percent: discountData.percent,
        },
      }),
    };

    createOrder(orderData);
  };

  return (
    <>
      <div className="w-full flex-1">
        {cart.length ? (
          <>
            <div className="w-full overflow-x-auto rounded-2xl shadow-card">
              <table className="w-full min-w-[640px] border-collapse bg-white text-text dark:bg-ink-800 dark:text-gray-100">
                <thead>
                  <tr>
                    {["Product", "Price", "Number", "Total", ""].map((title) => (
                      <th
                        key={title || "actions"}
                        className="bg-sage-400 p-4 text-center text-sm font-semibold uppercase tracking-wide text-white"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => (
                    <tr key={item._id}>
                      <td className="w-[250px] border-b border-gray-200 p-4 text-left align-middle dark:border-white/10">
                        <div className="flex items-center gap-4">
                          <Image
                            width={80}
                            height={80}
                            src={item.img}
                            alt={item.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />

                          <Link
                            href="/"
                            className="text-sm font-medium leading-6 text-text dark:text-gray-100"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </td>

                      <td className="border-b border-gray-200 p-4 text-center align-middle text-sm font-semibold !text-gray-500 dark:border-white/10 dark:text-gray-400">
                        {item.price.toLocaleString()} $
                      </td>

                      <td className="min-w-[180px] border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                        <div className="mx-auto flex w-[100px] items-center justify-between overflow-hidden rounded-lg border-2 border-coral-300">
                          <button
                            type="button"
                            onClick={() => decreaseCount(item._id)}
                            className="flex-1 select-none bg-gray-50 py-1 text-center transition-colors hover:bg-coral-300 hover:text-white dark:bg-ink-800"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>

                          <span className="px-2">{item.count}</span>

                          <button
                            type="button"
                            onClick={() => increaseCount(item._id)}
                            className="flex-1 select-none bg-gray-50 py-1 text-center transition-colors hover:bg-coral-300 hover:text-white dark:bg-ink-800"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                        {(item.count * item.price).toLocaleString()} $
                      </td>

                      <td className="border-b border-gray-200 p-4 text-center align-middle dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          aria-label="Remove from cart"
                        >
                          <IoMdClose className="text-2xl text-danger-500 transition-transform hover:scale-125" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <section className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => router.refresh()}
                className="btn btn-secondary"
              >
                Update Shopping Cart
              </button>

              <div className="flex h-11 items-center overflow-hidden rounded-lg border border-coral-300">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && discountHandler()}
                  placeholder="Discount code"
                  className="h-full w-[140px] border-none bg-transparent px-4 text-sm outline-none sm:w-[180px]"
                />

                <button
                  type="button"
                  onClick={discountHandler}
                  className="h-full whitespace-nowrap bg-coral-300 px-4 text-sm font-semibold text-white transition-colors hover:bg-coral-400 disabled:opacity-60 sm:px-5"
                  disabled={isApplyingDiscount}
                >
                  {isApplyingDiscount ? "Applying..." : "Submit"}
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

            <div>
              <Link href="/category" className="btn btn-accent">
                Go To Store
              </Link>
            </div>
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
          <div className="flex flex-col gap-1">
            {shippingFields.map((field) => (
              <div key={field}>
                <input
                  {...formRegister(field)}
                  placeholder={field}
                  className={`input w-full ${errors[field] ? "input-error" : ""}`}
                />

                {errors[field] && (
                  <p className="mt-1 text-xs text-danger-500">
                    {errors[field].message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-row items-center justify-between border-t border-gray-200 pt-4 dark:border-white/10">
            <p>Total</p>

            <p className="text-xl font-bold text-sage-500">
              {discountedTotal.toLocaleString()} $
            </p>
          </div>

          <button
            type="submit"
            disabled={!cart.length || isCreatingOrder}
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