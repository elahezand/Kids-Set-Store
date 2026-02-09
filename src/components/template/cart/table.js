"use client";
import useShop from "@/utils/hooks/useShop";
import { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from 'react-hot-toast'
import Image from "next/image";
import totalStyles from "./totals.module.css";
import styles from "./table.module.css";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { TbShoppingCartX } from "react-icons/tb";
import { usePost } from "@/utils/hooks/useReactQueryPublic";
import { manageError } from "@/utils/helper";


// Zod schema for shipping address
const shippingSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().min(8, "Phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(4, "Postal code is required"),
})
const Table = ({ user }) => {
    const { removeFromCart, cart, addTocard, increaseCount, decreaseCount } = useShop()
    const router = useRouter()

    const refreshCart = () => {
        router.refresh()
    }

    const discountHandeler = async () => {
        const res = await fetch(`/api/discount/${discount}`, {
            method: "PUT"
        })

        if (res.status !== 200) return manageError(res.status)

        const data = await res.json()
        setTotal(prev => prev = prev - (prev * data.discount.percent / 100))
    }

    const [total, setTotal] = useState(0)
    const [discount, setDiscount] = useState("")

    const calculateProducts = useCallback(() => {
        if (cart.length) {
            setTotal(cart.reduce((prev, current) => prev + current.price * current.count, 0))
        }
    }, [cart])

    useEffect(() => {
        calculateProducts()
    }, [calculateProducts]);


    const { mutate } = usePost("/orders", {
        onSuccess: () => {
            toast.success("Order created successfully!")
            setCart([])
        }
    })

    const { handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(shippingSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
        }
    })

    const submitOrder = (data) => {
        if (!cart.length) return toast.error("Cart is empty")
        const orderData = {
            user,
            items: cart,
            totalPrice: total,
            shippingAddress: data
        }
        mutate(orderData)
    }



    return (
        <>
            <div className={styles.tabel_container}>
                {cart.length ?
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
                            {cart.map((item, index) => (
                                <tbody key={index + 1}>
                                    <tr>
                                        <td className={styles.product}>
                                            <Image
                                                width={200}
                                                height={200}
                                                src={item.img}
                                                alt="" />
                                            <Link href={"/"}>{item.name}</Link>
                                        </td>
                                        <td className={styles.price}>
                                            {item.price.toLocaleString()} $
                                        </td>
                                        <td className={styles.counter}>
                                            <div className="cart">
                                                <button onClick={() =>
                                                    addTocard(null, null, null, item._id, item.count)}>
                                                    Add To Card  </button>
                                                <div>
                                                    <span onClick={() => {
                                                        decreaseCount(item._id)
                                                    }}> -</span>
                                                    {item.count}
                                                    <span onClick={() => {
                                                        increaseCount(item._id)
                                                    }}> +</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{(item.count * item.price).toLocaleString()}$</td>
                                        <td onClick={() => removeFromCart(item._id)}>
                                            <IoMdClose className={styles.delete_icon} />
                                        </td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                        <section>
                            <button
                                onClick={refreshCart}
                                className={styles.update_btn}>
                                Update Shopping Card</button>
                            <div className={styles.discount}>
                                <input type="text"
                                    onChange={(e) => setDiscount(e.target.value)}
                                    placeholder="Discount code " />
                                <button
                                    onClick={discountHandeler}
                                    className={styles.set_off_btn}>
                                    Submit</button>
                            </div>
                        </section>
                    </>
                    :
                    <div className={styles.cart_empty} data-aos="fade-up">
                        <TbShoppingCartX />
                        <p>No Product yet</p>
                        <span>In The Store Page , You Will See Ingteresting Products :)</span>
                        <div>
                            <Link href='/category'>Go To Store </Link>
                        </div>
                    </div>}
            </div>
            <div className={totalStyles.totals}>
                <p className={totalStyles.totals_title}>Card Total</p>
                <div className={totalStyles.address_details}>
                    <form onSubmit={handleSubmit(submitOrder)}>
                        <h6>Shipping Address</h6>
                        {["fullName", "phone", "address", "city", "postalCode"].map((field) => (
                            <Controller
                                key={field}
                                name={field}
                                control={control}
                                render={({ field: controllerField }) => (
                                    <div className={totalStyles.input_group}>
                                        <input
                                            {...controllerField}
                                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
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
                            <p>{total} $</p>
                        </div>
                        <button type="submit" className={totalStyles.checkout_btn}>Proceed to Checkout</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Table;
