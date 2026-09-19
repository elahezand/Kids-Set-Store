"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { usePost } from "@/utils/hooks/useReactQuery";

const RESEND_SECONDS = 120;

const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{4,6}$/, "Code must be 4 to 6 digits");

const Sms = ({ phone, setShowOtp }) => {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

  const { mutate: verifyCode, isPending: isVerifying } = usePost(
    "/auth/sms/verify",
    {
      axiosConfig: { skipRefresh: true },
      errorFallback: "Invalid verification code",

      onSuccess: () => {
        toast.success("Logged in successfully :)");
        router.replace("/");
        router.refresh();
      },
    }
  );

  const { mutate: resendCode, isPending: isResending } = usePost(
    "/auth/sms/send",
    {
      axiosConfig: { skipRefresh: true },
      errorFallback: "Failed to resend code",

      onSuccess: () => {
        toast.success("Code sent again :)");
        setCode("");
        setCodeError("");
        setResendTimer(RESEND_SECONDS);
      },
    }
  );

  const verifyHandler = (e) => {
    e.preventDefault();

    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0].message);
      return;
    }

    setCodeError("");
    verifyCode({ phone, code: parsed.data });
  };

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timeout = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendTimer]);

  return (
    <div className="w-full">
      <form onSubmit={verifyHandler} className="auth-card" noValidate>
        <p className="font-semibold text-text dark:text-gray-100">
          Verification Code
        </p>
        <label
          htmlFor="otp-code"
          className="text-sm font-bold text-text dark:text-gray-300"
        >
          Please Enter Verification Code
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

        <button
          type="submit"
          className="btn btn-primary w-full disabled:opacity-60"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={() => resendCode({ phone })}
          disabled={resendTimer > 0 || isResending}
          className="text-sm font-medium text-sage-500 transition-colors hover:text-sage-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending
            ? "Sending..."
            : resendTimer > 0
              ? `Send code again in ${resendTimer}s`
              : "Send Code again"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setShowOtp(false)}
        className="btn btn-accent mx-auto mt-6 flex w-max"
      >
        Cancel
      </button>
    </div>
  );
};

export default Sms;