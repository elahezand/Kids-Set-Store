"use client";

import { useState } from "react";
import Link from "next/link";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OtpForm from "@/components/template/main/login-register/otpForm";
import { useSendOtp, useSignUp } from "@/services/client/auth";
import { PHONE_REGEX } from "@/validators/authForm";
import { ROUTES } from "@/utils/constants";
import { userValidationSchema } from "@/validators/user";
import type { SignUpPayload } from "@/types";

const RegisterForm = ({ showLoginForm }: { showLoginForm: () => void }) => {
  const [otpPhone, setOtpPhone] = useState<string | null>(null);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<SignUpPayload>({
    resolver: zodResolver(userValidationSchema) as unknown as Resolver<SignUpPayload>,
    mode: "onChange",
    defaultValues: { username: "", email: "", phone: "", password: "" },
  });

  const signUp = useSignUp();
  const sendOtp = useSendOtp({ onSent: (phone) => setOtpPhone(phone) });

  const handleOtp = async () => {
    const isValid = await trigger("phone");
    const phone = getValues("phone")?.trim();

    if (!isValid || !PHONE_REGEX.test(phone)) {
      setError("phone", { message: "Enter a valid phone number to register with a code" });
      return;
    }

    sendOtp.mutate({ phone });
  };

  if (otpPhone) return <OtpForm phone={otpPhone} onCancel={() => setOtpPhone(null)} />;

  return (
    <form onSubmit={handleSubmit((data) => signUp.mutate(data))} className="w-full" noValidate>
      <div className="auth-card">
        <div className="text-left">
          <input className="input" placeholder="Username" autoComplete="username" {...register("username")} />
          {errors.username && <span className="field-error">{errors.username.message}</span>}
        </div>

        <div className="text-left">
          <input
            className="input"
            type="email"
            placeholder="Email (optional)"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div className="text-left">
          <input
            className="input"
            type="tel"
            inputMode="numeric"
            placeholder="Phone"
            autoComplete="tel"
            {...register("phone")}
          />
          {errors.phone && <span className="field-error">{errors.phone.message}</span>}
        </div>

        {showPasswordField && (
          <div className="text-left">
            <input
              className="input"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
            <small className="field-hint text-brand-500">Upper and lower case, a number and a symbol (@ # ! ...)</small>
          </div>
        )}

        {showPasswordField ? (
          <button type="submit" className="btn btn-primary w-full disabled:opacity-60" disabled={signUp.isPending}>
            {signUp.isPending ? "Registering..." : "Register"}
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full" onClick={() => setShowPasswordField(true)}>
            Register with password
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary w-full disabled:opacity-60"
          onClick={handleOtp}
          disabled={sendOtp.isPending}
        >
          {sendOtp.isPending ? "Sending..." : "Register with phone"}
        </button>

        <button type="button" onClick={showLoginForm} className="mt-2 font-bold text-text dark:text-gray-100">
          Already have an account? <br />
          <strong className="text-brand-500">Log In</strong>
        </button>
      </div>

      <Link href={ROUTES.home} className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default RegisterForm;
