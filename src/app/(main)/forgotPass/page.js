"use client"
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import styles from "@/components/template/login-register/register-login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

const phoneSchema = z.object({
    phone: z
        .string()
        .length(11, "Phone number must be exactly 11 digits")
        .regex(/^09\d{9}$/, "Invalid Iranian phone number format"),
});

const resetPasswordSchema = z.object({
    resetCode: z.string().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const ForgotPassword = () => {
    const router = useRouter();
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    const { register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: phoneErrors } } = useForm({
        resolver: zodResolver(phoneSchema),
    });

    const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const sendCodeMutation = useMutation({
        mutationFn: async (phone) => await axios.post("/api/auth/sms/send", { phone }),
        onSuccess: () => {
            toast.success("Code sent successfully!");
            setShowResetPassword(true);
            setResendTimer(120);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to send code"),
    });

    const forgotPassHandler = (data) => {
        setPhoneNumber(data.phone);
        sendCodeMutation.mutate(data.phone);
    };

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ phone, resetCode, newPassword }) =>
            await axios.post("/api/reset-password", { phone, resetCode, password: newPassword }),
        onSuccess: () => {
            toast.success("Password reset successfully!");
            router.replace("/login-register");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to reset password"),
    });

    const changePasswordHandler = (data) => {
        resetPasswordMutation.mutate({
            phone: phoneNumber,
            resetCode: data.resetCode,
            newPassword: data.newPassword
        });
    };

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    return (
        <div className="forgot_password">
            <div data-aos="fade-up" className={styles.bg}>
                <div className={styles.form}>
                    {!showResetPassword ? (
                        <form onSubmit={handleSubmitPhone(forgotPassHandler)}>
                            <label>Phone Number</label>
                            <input
                                className={styles.input}
                                type="text"
                                {...registerPhone("phone")}
                            />
                            {phoneErrors.phone && <p style={{ color: "red" }}>{phoneErrors.phone.message}</p>}
                            <button
                                type="submit"
                                className={styles.btn}
                                disabled={sendCodeMutation.isPending}
                            >
                                {sendCodeMutation.isPending ? "Sending..." : "Send Code"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmitReset(changePasswordHandler)}>
                            <label>Reset Code</label>
                            <input
                                className={styles.input}
                                type="text"
                                {...registerReset("resetCode")}
                            />
                            {resetErrors.resetCode && <p style={{ color: "red" }}>{resetErrors.resetCode.message}</p>}

                            <label>New Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                {...registerReset("newPassword")}
                            />
                            {resetErrors.newPassword && <p style={{ color: "red" }}>{resetErrors.newPassword.message}</p>}
                            <small>Include Upper, Lower Case, Number and @</small>

                            <button
                                type="submit"
                                className={styles.btn}
                                disabled={resetPasswordMutation.isPending}
                            >
                                {resetPasswordMutation.isPending ? "Processing..." : "Reset Password"}
                            </button>

                            <button
                                type="button"
                                className={styles.btn}
                                disabled={resendTimer > 0 || sendCodeMutation.isPending}
                                onClick={() => sendCodeMutation.mutate(phoneNumber)}
                                style={{ marginTop: "1rem" }}
                            >
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                            </button>
                        </form>
                    )}

                    <Link href={"/login-register"} className={styles.back_to_login}>Back To Login</Link>
                </div>
                <Link href={"/login-register"} className={styles.redirect_to_home}>Cancel</Link>
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
    );
};

export default ForgotPassword;