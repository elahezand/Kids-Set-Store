"use client"
import React from 'react'
import { usePost } from '@/utils/hooks/useReactQueryPublic'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from 'react-hook-form'
import styles from "./form.module.css";
import { contactValidationSchema } from "../../../../../validators/contact";
import toast from 'react-hot-toast'
const Form = () => {
    // React Hook Form setup
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contactValidationSchema),
    })

    const { mutate } = usePost("/contact", {
        onSuccess: () => {
            toast.success("your Message Sent Successfully :)")
        },
    })

    const onSubmit = async (data) => mutate(data)

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}>
            <span>Contact  With Us</span>
            <p>To Conact Us ,Please Fill Out The Form Below :)</p>
            <div className={styles.groups}>
                <div className={styles.group}>
                    <label>Name & LastName</label>
                    <input
                        {...formRegister("name")}
                        type="text" />
                </div>
                <div className={styles.group}>
                    <label> Email</label>
                    <input
                        {...formRegister("email")}
                        type="text" />
                </div>
            </div>
            <div className={styles.groups}>
                <div className={styles.group}>
                    <label> Phone</label>
                    <input
                        {...formRegister("phone")}
                        type="text" />
                </div>
                <div className={styles.group}>
                    <label>Company</label>
                    <input
                        {...formRegister("company")}
                        type="text" />
                </div>
            </div>
            <div className={styles.group}>
                <label>Your Request</label>
                <textarea
                    {...formRegister("body")}
                    name="" id="" cols="30" rows="3"></textarea>
            </div>
            <button
                type="submit"
                className={`${styles.btn}`}>Send Message</button>
        </form>
    );
};

export default Form;
