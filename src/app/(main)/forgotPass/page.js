"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AuthShell from "@/components/modules/main/authShell";
import { usePost } from "@/utils/hooks/useReactQuery";

const RESEND_SECONDS = 120;

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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const showResetPassword = Boolean(phoneNumber);

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { resetCode: "", newPassword: "" },
  });

  const { mutate: sendCode, isPending: isSendingCode } = usePost(
    "/auth/sms/send",
    {
      axiosConfig: { skipRefresh: true },
      errorFallback: "Failed to send code",

      onSuccess: (_, variables) => {
        toast.success("Code sent successfully!");
        setPhoneNumber(variables.phone);
        setResendTimer(RESEND_SECONDS);
      },
    }
  );

  const { mutate: resetPassword, isPending: isResetting } = usePost(
    "/reset-password",
    {
      axiosConfig: { skipRefresh: true },
      errorFallback: "Failed to reset password",

      onSuccess: () => {
        toast.success("Password reset successfully!");
        router.replace("/login-register");
      },
    }
  );

  const forgotPassHandler = ({ phone }) => sendCode({ phone });

  const changePasswordHandler = ({ resetCode, newPassword }) => {
    resetPassword({
      phone: phoneNumber,
      resetCode,
      password: newPassword,
    });
  };

  const changeNumberHandler = () => {
    setPhoneNumber("");
    setResendTimer(0);
    resetResetForm();
  };

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendTimer]);

  return (
    <AuthShell image="/images/55694782091264d5234a0dad5cbf505a.jpg">
      <div className="auth-card">
        {!showResetPassword ? (
          <form
            onSubmit={handleSubmitPhone(forgotPassHandler)}
            className="flex flex-col gap-1.5 text-left"
            noValidate
          >
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <input
              id="phone"
              className="input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              {...registerPhone("phone")}
            />
            {phoneErrors.phone && (
              <p className="field-error">{phoneErrors.phone.message}</p>
            )}

            <button
              type="submit"
              className="btn btn-primary mt-3 w-full"
              disabled={isSendingCode}
            >
              {isSendingCode ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitReset(changePasswordHandler)}
            className="flex flex-col gap-1.5 text-left"
            noValidate
          >
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Code sent to <span className="font-semibold">{phoneNumber}</span>{" "}
              <button
                type="button"
                onClick={changeNumberHandler}
                className="font-semibold text-coral-400 underline"
              >
                Change
              </button>
            </p>

            <label htmlFor="resetCode" className="label">
              Reset Code
            </label>
            <input
              id="resetCode"
              className="input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              {...registerReset("resetCode")}
            />
            {resetErrors.resetCode && (
              <p className="field-error">{resetErrors.resetCode.message}</p>
            )}

            <label htmlFor="newPassword" className="label mt-2">
              New Password
            </label>
            <input
              id="newPassword"
              className="input"
              type="password"
              autoComplete="new-password"
              {...registerReset("newPassword")}
            />
            {resetErrors.newPassword && (
              <p className="field-error">{resetErrors.newPassword.message}</p>
            )}
            <small className="field-hint text-sage-500">
              Include Upper, Lower Case, Number and @
            </small>

            <button
              type="submit"
              className="btn btn-primary mt-3 w-full"
              disabled={isResetting}
            >
              {isResetting ? "Processing..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full"
              disabled={resendTimer > 0 || isSendingCode}
              onClick={() => sendCode({ phone: phoneNumber })}
            >
              {isSendingCode
                ? "Sending..."
                : resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : "Resend Code"}
            </button>
          </form>
        )}

        <Link
          href="/login-register"
          className="mt-2 text-sm font-semibold text-text dark:text-gray-100"
        >
          Back To Login
        </Link>
      </div>

      <Link href="/login-register" className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </AuthShell>
  );
};

export default ForgotPassword;