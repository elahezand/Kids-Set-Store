"use client"
import React, { useState } from "react";
import styles from "@/components/template/login-register/register-login.module.css"
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast'
import Image from "next/image";


// Zod schema for validation
const resetPasswordSchema = z.object({
    phone: z
        .string()
        .length(11, "Phone number must be exactly 11 digits")
        .regex(/^09\d{9}$/, "Invalid Iranian phone number format"),
    resetCode: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
})

const ForgotPassword = () => {
    const router = useRouter()
    const [showResetPassword, setShowResetPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    })


    const { mutate: sendResetCode } = usePost("/api/auth/sms/send", {
        onSuccess: () => {
            toast.success("Your code sent successfully :)")
            setShowResetPassword(true)
        },
    })

    const forgotPassHandler = (data) => {
        sendResetCode({ phone: data.phone })
    }

    const { mutate: resetPassword } = usePost("/api/reset-password", {
        onSuccess: () => {
            toast.success("Your password reset successfully :)"),
            router.replace("/")
        }
    })

    const changePasswordHandler = (data) => {
        resetPassword({
            password: newPassword,
            phone: phone
        })
    }


    return (
        <>
            <div className="forgot_password">
                <div data-aos="fade-up" className={styles.bg}>
                    <div className={styles.form}>
                        {!showResetPassword ?
                            <form
                                onSubmit={handleSubmit(forgotPassHandler)}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="PhoneNumber "
                                    {...register("phone")}
                                />
                                <button
                                    type="dubmit"
                                    style={{ marginTop: "1rem" }}
                                    className={styles.btn}>
                                    Reset Password
                                </button>
                            </form>
                            :
                            <form
                                onSubmit={handleSubmit(changePasswordHandler)}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="newPassword "
                                    {...register("password")}
                                />
                                <small style={{ margin: "0.5rem", color: "var(--main-color)" }}>
                                    Include Up,Lower Case, Number and @</small>
                                <button
                                    type="submit"
                                    style={{ marginTop: "1rem" }}
                                    className={styles.btn}>
                                    Send
                                </button>
                            </form>
                        }
                        <Link href={"/login-register"} className={styles.back_to_login}>
                            Back To Login
                        </Link>
                    </div>
                    <Link href={"/login-register"} className={styles.redirect_to_home}>
                        Cancel
                    </Link>

                </div>
                <div className="image-container">
                    <Image
                        width={1000}
                        height={1000}
                        src="/images/55694782091264d5234a0dad5cbf505a.jpg"
                        alt=""
                    />
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;


