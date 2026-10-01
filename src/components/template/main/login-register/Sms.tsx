"use client";

import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { useSendOtp, useVerifyOtp } from "@/services/client/auth";

const RESEND_SECONDS = 60; // = OTP_TTL_SECONDS in /api/auth/sms/send

const codeSchema = z.string().trim().regex(/^\d{4,6}$/, "Code must be 4 to 6 digits");

interface SmsProps {
  phone: string;
  onCancel: () => void;
}

const Sms = ({ phone, onCancel }: SmsProps) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

  const verify = useVerifyOtp();
  const resend = useSendOtp({
    message: "Code sent again :)",
    onSent: () => {
      setCode("");
      setCodeError("");
      setResendTimer(RESEND_SECONDS);
    },
  });

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendTimer]);

  const verifyHandler = (e: FormEvent) => {
    e.preventDefault();
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0].message);
      return;
    }
    setCodeError("");
    verify.mutate({ phone, code: parsed.data });
  };

  return (
    <div className="w-full">
      <form onSubmit={verifyHandler} className="auth-card" noValidate>
        <p className="font-semibold text-text dark:text-gray-100">Verification Code</p>
        <label htmlFor="otp-code" className="text-sm font-bold text-text dark:text-gray-300">
          Please enter the code we sent to
        </label>
        <span className="text-sm text-gray-600 dark:text-gray-400">{phone}</span>

        <input
          id="otp-code"
          className={`input text-center tracking-widest ${codeError ? "input-error" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        {codeError && <p className="field-error">{codeError}</p>}

        <button type="submit" className="btn btn-primary w-full disabled:opacity-60" disabled={verify.isPending}>
          {verify.isPending ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={() => resend.mutate({ phone })}
          disabled={resendTimer > 0 || resend.isPending}
          className="text-sm font-medium text-sage-500 transition-colors hover:text-sage-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resend.isPending ? "Sending..." : resendTimer > 0 ? `Send code again in ${resendTimer}s` : "Send code again"}
        </button>
      </form>

      <button type="button" onClick={onCancel} className="btn btn-accent mx-auto mt-6 flex w-max">
        Cancel
      </button>
    </div>
  );
};

export default Sms;
