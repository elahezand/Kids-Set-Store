"use client"
import React from 'react'
import { useRouter } from 'next/navigation';
import { usePost } from '@/utils/hooks/useReactQueryPanel';
import { discountSchema } from '../../../../../validators/discount';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import styles from "./addDiscount.module.css"
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function AddDiscount({ products }) {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            code: "",
            percent: 0,
            maxUses: 0,
            productID: products[0]?._id || "",
            expTime: new Date()
        }
    })

    const { mutate, isLoading } = usePost("/discounts", {
        onSuccess: () => {
            toast.success("Discount added successfully :)")
            router.refresh()
        },

    })

    const onSubmit = (data) => {
        mutate(data)
    }

    return (
        <section className={styles.discount}>
            <div>
                <h1 className="title">
                    <span> Add New Code</span>
                </h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                <div>
                    <label>Code</label>
                    <input {...register("code")} type="text" />
                    {errors.code && <p className={styles.error}>{errors.code.message}</p>}
                </div>

                <div>
                    <label>Percent</label>
                    <input
                        {...register("percent", { valueAsNumber: true })}
                        type="number"
                    />
                    {errors.percent && <p className={styles.error}>{errors.percent.message}</p>}
                </div>

                <div>
                    <label>Max Usage</label>
                    <input
                        {...register("maxUses", { valueAsNumber: true })}
                        type="number"
                    />
                    {errors.maxUses && <p className={styles.error}>{errors.maxUses.message}</p>}
                </div>

                <div>
                    <label>Product</label>
                    <select {...register("productID")}>
                        <option value="">Select a product</option>
                        {products.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    {errors.productID && <p className={styles.error}>{errors.productID.message}</p>}
                </div>

                <div>
                    <label>Expire Time</label>
                    <Controller
                        control={control}
                        name="expTime"
                        render={({ field }) => (
                            <DatePicker
                                className={styles.datePicker}
                                onChange={(date) => field.onChange(date)}
                                selected={field.value}
                                placeholderText="Select Expire Date"
                                minDate={new Date()}
                            />
                        )}
                    />
                    {errors.expTime && <p className={styles.error}>{errors.expTime.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                    {isLoading ? "Sending..." : "Create"}
                </button>
            </form>
        </section>
    )
}