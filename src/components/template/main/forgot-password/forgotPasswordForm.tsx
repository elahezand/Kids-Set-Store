"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AuthShell from "@/components/modules/main/authShell";
import { useResetPassword, useSendOtp } from "@/services/client/auth";
import { strongPasswordSchema } from "@/validators/user";
import type { SendOtpPayload } from "@/types";

const RESEND_SECONDS = 60; // = OTP_TTL_SECONDS in /api/auth/sms/send

const phoneSchema = z.object({
  phone: z.string().trim().regex(/^09\d{9}$/, "Enter a valid phone number (09xxxxxxxxx)"),
});

// same rules as validators/user resetPasswordSchema (POST /api/reset-password)
const resetSchema = z.object({
  resetCode: z.string().trim().regex(/^\d{4,6}$/, "Code must be 4 to 6 digits"),
  newPassword: strongPasswordSchema,
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const phoneForm = useForm<SendOtpPayload>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { resetCode: "", newPassword: "" },
  });

  const sendCode = useSendOtp({
    onSent: (phone) => {
      setPhoneNumber(phone);
      setResendTimer(RESEND_SECONDS);
    },
  });
  const resetPassword = useResetPassword();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendTimer]);

  const changeNumber = () => {
    setPhoneNumber("");
    setResendTimer(0);
    resetForm.reset();
  };

  const phoneErrors = phoneForm.formState.errors;
  const resetErrors = resetForm.formState.errors;

  return (
    <AuthShell image="/images/55694782091264d5234a0dad5cbf505a.jpg">
      <div className="auth-card">
        {!phoneNumber ? (
          <form
            onSubmit={phoneForm.handleSubmit((data) => sendCode.mutate(data))}
            className="flex flex-col gap-1.5 text-left"
            noValidate
          >
            <label htmlFor="phone" className="label">
              Phone Number
            </label>
            <input id="phone" className="input" type="tel" inputMode="numeric" autoComplete="tel" {...phoneForm.register("phone")} />
            {phoneErrors.phone && <p className="field-error">{phoneErrors.phone.message}</p>}

            <button type="submit" className="btn btn-primary mt-3 w-full" disabled={sendCode.isPending}>
              {sendCode.isPending ? "Sending..." : "Send Code"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(({ resetCode, newPassword }) =>
              resetPassword.mutate({ phone: phoneNumber, resetCode, password: newPassword })
            )}
            className="flex flex-col gap-1.5 text-left"
            noValidate
          >
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Code sent to <span className="font-semibold">{phoneNumber}</span>{" "}
              <button type="button" onClick={changeNumber} className="font-semibold text-coral-400 underline">
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
              {...resetForm.register("resetCode")}
            />
            {resetErrors.resetCode && <p className="field-error">{resetErrors.resetCode.message}</p>}

            <label htmlFor="newPassword" className="label mt-2">
              New Password
            </label>
            <input id="newPassword" className="input" type="password" autoComplete="new-password" {...resetForm.register("newPassword")} />
            {resetErrors.newPassword && <p className="field-error">{resetErrors.newPassword.message}</p>}
            <small className="field-hint text-sage-500">Upper and lower case, a number and a symbol (@ # ! ...)</small>

            <button type="submit" className="btn btn-primary mt-3 w-full" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Processing..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full"
              disabled={resendTimer > 0 || sendCode.isPending}
              onClick={() => sendCode.mutate({ phone: phoneNumber })}
            >
              {sendCode.isPending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </form>
        )}

        <Link href="/login-register" className="mt-2 text-sm font-semibold text-text dark:text-gray-100">
          Back To Login
        </Link>
      </div>
    </AuthShell>
  );
}
