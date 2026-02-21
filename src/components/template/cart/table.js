"use client";
import useShop from "@/utils/hooks/useShop";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Image from "next/image";
import totalStyles from "./totals.module.css";
import styles from "./table.module.css";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { TbShoppingCartX } from "react-icons/tb";
import { usePost } from "@/utils/hooks/useReactQueryPublic";

const shippingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

const Table = ({ user }) => {
  const { removeFromCart, cart, increaseCount, decreaseCount, clearCart } = useShop();
  const router = useRouter();

  const [discount, setDiscount] = useState("");
  const [discountData, setDiscountData] = useState(null); 
  const [loadingDiscount, setLoadingDiscount] = useState(false); 

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

  const { mutate: applyDiscount } = usePost("/discount/use", {
    onMutate: () => setLoadingDiscount(true),
    onSuccess: (data) => {
      setDiscountData({ productId: data.productId, percent: data.percent });
      toast.success("Discount applied!");
    },
    onError: () => toast.error("Invalid discount code"),
    onSettled: () => setLoadingDiscount(false),
  });

  const discountHandler = () => {
    if (!discount.trim()) return toast.error("Enter discount code");
    if (loadingDiscount) return;
    applyDiscount({ code: discount });
  };

  const { mutate: createOrder } = usePost("/orders", {
    onSuccess: () => {
      toast.success("Order created successfully!");
      clearCart();
      router.refresh();
    },
  });

  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  const submitOrder = (data) => {
    if (!cart.length) return toast.error("Cart is empty");

    const orderData = {
      user,
      items: cart,
      totalPrice: discountedTotal, 
      shippingAddress: data,
    };

    createOrder(orderData);
  };

  return (
    <>
      <div className={styles.tabel_container}>
        {cart.length ? (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Number</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>

              {cart.map((item) => (
                <tbody key={item._id}>
                  <tr>
                    <td className={styles.product}>
                      <Image width={200} height={200} src={item.img} alt="" />
                      <Link href="/">{item.name}</Link>
                    </td>

                    <td className={styles.price}>
                      {item.price.toLocaleString()} $
                    </td>

                    <td className={styles.counter}>
                      <div>
                        <span onClick={() => decreaseCount(item._id)}> - </span>
                        {item.count}
                        <span onClick={() => increaseCount(item._id)}> + </span>
                      </div>
                    </td>

                    <td>
                      {(item.count * item.price).toLocaleString()} $
                    </td>

                    <td onClick={() => removeFromCart(item._id)}>
                      <IoMdClose className={styles.delete_icon} />
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>

            <section>
              <button onClick={() => router.refresh()} className={styles.update_btn}>
                Update Shopping Cart
              </button>

              <div className={styles.discount}>
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Discount code"
                />
                <button
                  onClick={discountHandler}
                  className={styles.set_off_btn}
                  disabled={loadingDiscount} 
                >
                  {loadingDiscount ? "Applying..." : "Submit"}
                </button>
              </div>
            </section>
          </>
        ) : (
          <div className={styles.cart_empty}>
            <TbShoppingCartX />
            <p>No Product yet</p>
            <div>
              <Link href="/category">Go To Store</Link>
            </div>
          </div>
        )}
      </div>

      <div className={totalStyles.totals}>
        <p className={totalStyles.totals_title}>Cart Total</p>
        <form onSubmit={handleSubmit(submitOrder)}>
          {["fullName", "phone", "address", "city", "postalCode"].map((field) => (
            <Controller
              key={field}
              name={field}
              control={control}
              render={({ field: controllerField }) => (
                <div className={totalStyles.address_details}>
                  <input
                    {...controllerField}
                    placeholder={field}
                    className={errors[field] ? totalStyles.input_error : ""}
                  />
                  {errors[field] && (
                    <span className={totalStyles.error_message}>
                      {errors[field]?.message}
                    </span>
                  )}
                </div>
              )}
            />
          ))}

          <div className={totalStyles.total}>
            <p>Total</p>
            <p>{discountedTotal.toLocaleString()} $</p>
          </div>

          <button type="submit" className={totalStyles.checkout_btn}>
            Proceed to Checkout
          </button>
        </form>
      </div>
    </>
  );
};

export default Table;