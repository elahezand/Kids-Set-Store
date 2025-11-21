"use client";
import useShop from "@/hooks/useShop";
import { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import Image from "next/image";
import totalStyles from "./totals.module.css";
import countryList from 'react-select-country-list'
import styles from "./table.module.css";
import Link from "next/link";
import { IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";
import { TbShoppingCartX } from "react-icons/tb";
import { manageError } from "@/utils/helper";

const Table = () => {
    const { removeFromCart, cart, addTocard, increaseCount, decreaseCount } = useShop()
    const router = useRouter()

    const [changeAddress, setChangeAddress] = useState(false);
    const [stateSelectedOption, setStateSelectedOption] = useState(null);

    const [total, setTotal] = useState(null)
    const [discount, setDiscount] = useState("")

    const options = useMemo(() => countryList().getData(), [])

    const calculateProducts = useCallback(() => {
        if (cart.length) {
            setTotal(cart.reduce((prev, current) => prev + current.price * current.count, 0))
        }
    }, [cart])


    useEffect(() => {
        calculateProducts()
    }, [calculateProducts]);


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
                <p
                    onClick={() => setChangeAddress((prev) => !prev)}
                    className={totalStyles.change_address}>
                    Change Address
                </p>
                {changeAddress && (
                    <div className={totalStyles.address_details}>
                        <Select
                            defaultValue={stateSelectedOption}
                            onChange={setStateSelectedOption}
                            isClearable={true}
                            placeholder={"State"}
                            isRtl={true}
                            isSearchable={true}
                            options={options}
                        />
                        <input type="text" placeholder="City" />
                        <input type="number" placeholder="Postal Code " />
                        <button onClick={() => setChangeAddress(false)}>Update</button>
                    </div>
                )}
                <div className={totalStyles.total}>
                    <p>Total</p>
                    <p>{total} $</p>
                </div>
                <Link href={"/checkout"}>
                    <button className={totalStyles.checkout_btn}>
                        Continue To Payment...
                    </button>
                </Link>
            </div>
        </>
    );
};

export default Table;
