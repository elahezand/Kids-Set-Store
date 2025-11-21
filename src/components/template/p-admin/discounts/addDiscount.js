"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import styles from "./addDiscount.module.css"
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { manageError } from '@/utils/helper';

export default function AddDiscount({ products }) {
    const router = useRouter()

    const [code, setCode] = useState("")
    const [percent, setPercent] = useState("")
    const [maxUses, setMaxUses] = useState("")
    const [expTime, seteExpTime] = useState("")
    const [productID, setProductID] = useState("")

    const addDiscount = async () => {
        try {
            const res = await fetch("/api/discount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code,
                    maxUses,
                    expTime,
                    productID,
                    percent,
                }
                )
            })

            if (res.status !== 200) return manageError(res.status)

            swal({
                title: "Code Created Successfully:)",
                icon: "success",
                buttons: "ok"
            }).then(result => {
                if (result) {
                    router.refresh()
                    setCode("")
                    setPercent("")
                    setMaxUses("")
                }
            })
        } catch (err) {
            swal({
                title: "NetWork Error",
                icon: "warning",
                buttons: "ok"
            })
        }
    }

    return (
        <section className={styles.discount}>
            <div>
                <h1 className="title">
                    <span> Add New Code</span>
                </h1>
            </div>
            <div className={styles.discount_main}>
                <div>
                    <label>Code</label>
                    <input
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value)}
                        type="text" />
                </div>
                <div>
                    <label>Percent</label>
                    <input
                        value={percent}
                        onChange={(e) =>
                            setPercent(e.target.value)}
                        type="text" />
                </div>
                <div>
                    <label>maxUsage </label>
                    <input
                        value={maxUses}
                        onChange={(e) =>
                            setMaxUses(e.target.value)}
                        type="text" />
                </div>
                <div>
                    <label>Product</label>
                    <select
                        onClick={(e) =>
                            setProductID(e.target.value)}
                        name="" id="">
                        {products.map((item, index) => (
                            <option
                                key={index}
                                value={item._id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <DatePicker
                className='Date-picker'
                selected={expTime}
                onChange={(expTime) =>
                    seteExpTime(expTime)}
                value='Expire Time' />
            <button
                onClick={addDiscount}
            >Create</button>
        </section>
    )
}
