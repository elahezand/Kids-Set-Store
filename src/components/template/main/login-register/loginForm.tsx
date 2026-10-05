"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OtpForm from "@/components/template/main/login-register/otpForm";
import { useSendOtp, useSignIn } from "@/services/client/auth";
import { PHONE_REGEX, phoneSchema } from "@/validators/authForm";
import { ROUTES } from "@/utils/constants";
import type { SignInPayload } from "@/types";

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or phone number is required")
    .refine(
      (value) => PHONE_REGEX.test(value) || z.string().email().safeParse(value).success,
      "Enter a valid email or phone number"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const LoginForm = ({ showRegisterForm }: { showRegisterForm: () => void }) => {
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { identifier: "", password: "", remember: false },
  });

  const signIn = useSignIn();
  const sendOtp = useSendOtp({ onSent: (phone) => setOtpPhone(phone) });

  const requestOtp = () => {
    const parsed = phoneSchema.safeParse(phoneInput);
    if (!parsed.success) {
      setPhoneError(parsed.error.issues[0].message);
      return;
    }
    setPhoneError("");
    sendOtp.mutate({ phone: parsed.data });
  };

  if (otpPhone) return <OtpForm phone={otpPhone} onCancel={() => setOtpPhone(null)} />;

  return (
    <form onSubmit={handleSubmit((data) => signIn.mutate(data))} className="w-full" noValidate>
      <div className="auth-card">
        <div className="text-left">
          <input
            className="input"
            type="text"
            placeholder="Email | Phone number"
            autoComplete="username"
            {...register("identifier")}
          />
          {errors.identifier && <span className="field-error">{errors.identifier.message}</span>}
        </div>

        <div className="text-left">
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && <span className="field-error">{errors.password.message}</span>}
        </div>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input type="checkbox" className="checkbox" {...register("remember")} />
          <span className="text-sm">Remember me</span>
        </label>

        <button type="submit" className="btn btn-primary w-full disabled:opacity-60" disabled={signIn.isPending}>
          {signIn.isPending ? "Signing in..." : "Sign In"}
        </button>

        <Link href={ROUTES.forgotPassword} className="text-sm text-gray-600 dark:text-gray-400">
          Forgot password?
        </Link>

        {showOtpInput ? (
          <div className="flex flex-col gap-2 text-left">
            <div className="flex gap-2">
              <input
                className={`input flex-1 ${phoneError ? "input-error" : ""}`}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="09xxxxxxxxx"
                aria-label="Phone number for one-time code"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    requestOtp();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary" onClick={requestOtp} disabled={sendOtp.isPending}>
                {sendOtp.isPending ? "Sending..." : "Send code"}
              </button>
            </div>
            {phoneError && <span className="field-error">{phoneError}</span>}
          </div>
        ) : (
          <button type="button" className="btn btn-secondary w-full" onClick={() => setShowOtpInput(true)}>
            Login with one-time code
          </button>
        )}

        <button type="button" onClick={showRegisterForm} className="mt-2 font-bold text-text dark:text-gray-100">
          Don&apos;t have an account? <br />
          <strong className="text-sage-500">Sign Up</strong>
        </button>
      </div>

      <Link href={ROUTES.home} className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default LoginForm;
