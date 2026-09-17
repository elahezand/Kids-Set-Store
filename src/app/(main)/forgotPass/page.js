"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthShell from "@/components/modules/main/authShell";

const phoneSchema = z.object({
    phone: z.string().length(11, "Phone number must be exactly 11 digits").regex(/^09\d{9}$/, "Invalid Iranian phone number format"),
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

    const { register: registerPhone, handleSubmit: handleSubmitPhone, formState: { errors: phoneErrors } } =
        useForm({ resolver: zodResolver(phoneSchema) });

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

    const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: resetErrors } } =
        useForm({ resolver: zodResolver(resetPasswordSchema) });

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
        resetPasswordMutation.mutate({ phone: phoneNumber, resetCode: data.resetCode, newPassword: data.newPassword });
    };

    useEffect(() => {
        let interval;
        if (resendTimer > 0) interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    return (
        <AuthShell image="/images/55694782091264d5234a0dad5cbf505a.jpg">
            <div className="auth-card">
                {!showResetPassword ? (
                    <form onSubmit={handleSubmitPhone(forgotPassHandler)} className="flex flex-col gap-1.5 text-left">
                        <label className="label">Phone Number</label>
                        <input className="input" type="text" {...registerPhone("phone")} />
                        {phoneErrors.phone && <p className="field-error">{phoneErrors.phone.message}</p>}
                        <button type="submit" className="btn btn-primary mt-3 w-full" disabled={sendCodeMutation.isPending}>
                            {sendCodeMutation.isPending ? "Sending..." : "Send Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitReset(changePasswordHandler)} className="flex flex-col gap-1.5 text-left">
                        <label className="label">Reset Code</label>
                        <input className="input" type="text" {...registerReset("resetCode")} />
                        {resetErrors.resetCode && <p className="field-error">{resetErrors.resetCode.message}</p>}

                        <label className="label mt-2">New Password</label>
                        <input className="input" type="password" {...registerReset("newPassword")} />
                        {resetErrors.newPassword && <p className="field-error">{resetErrors.newPassword.message}</p>}
                        <small className="field-hint text-sage-500">Include Upper, Lower Case, Number and @</small>

                        <button type="submit" className="btn btn-primary mt-3 w-full" disabled={resetPasswordMutation.isPending}>
                            {resetPasswordMutation.isPending ? "Processing..." : "Reset Password"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary w-full"
                            disabled={resendTimer > 0 || sendCodeMutation.isPending}
                            onClick={() => sendCodeMutation.mutate(phoneNumber)}
                        >
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                        </button>
                    </form>
                )}

                <Link href="/login-register" className="mt-2 cursor-pointer text-sm font-semibold text-text dark:text-gray-100">Back To Login</Link>
            </div>
            <Link href="/login-register" className="btn btn-accent mx-auto mt-6 w-max">
                Cancel
            </Link>
        </AuthShell>
    );
};

export default ForgotPassword;
