"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";
import { userValidationSchema } from "../../../../../validators/user";
import Sms from "./Sms";

const PHONE_REGEX = /^09\d{9}$/;

const Register = ({ showloginForm }) => {
  const router = useRouter();

  const [showOtp, setShowOtp] = useState(false);
  const [phone, setPhone] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userValidationSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  // Public auth route: no refresh on 401, show the real server message
  const { mutate: signUp, isPending: isSigningUp } = usePost("/auth/signup", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Sign up failed",

    onSuccess: () => {
      toast.success("Signed up successfully :)");
      router.replace("/");
      router.refresh();
    },
  });

  const { mutate: sendOtp, isPending: isSendingOtp } = usePost(
    "/auth/sms/send",
    {
      axiosConfig: { skipRefresh: true },
      errorFallback: "Failed to send OTP",

      onSuccess: (_, variables) => {
        toast.success("OTP sent successfully :)");
        setPhone(variables.phone);
        setShowOtp(true);
      },
    }
  );

  const onSubmit = (data) => signUp(data);

  // Uses the Phone field of the form instead of asking again in a popup
  const handleOtp = async () => {
    const isValid = await trigger("phone");
    const phoneNumber = getValues("phone")?.trim();

    if (!isValid || !PHONE_REGEX.test(phoneNumber)) {
      setError("phone", {
        message: "Enter a valid phone number to register with OTP",
      });
      return;
    }

    sendOtp({ phone: phoneNumber });
  };

  if (showOtp) {
    return <Sms phone={phone} setShowOtp={setShowOtp} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
      <div className="auth-card">
        <div className="text-left">
          <input
            className="input"
            placeholder="Username"
            autoComplete="username"
            {...register("username")}
          />
          {errors.username && (
            <span className="field-error">{errors.username.message}</span>
          )}
        </div>

        <div className="text-left">
          <input
            className="input"
            type="email"
            placeholder="Email (optional)"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
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
          {errors.phone && (
            <span className="field-error">{errors.phone.message}</span>
          )}
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
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
            <small className="field-hint text-sage-500">
              Include Upper, Lower Case, Number and @
            </small>
          </div>
        )}

        {!showPasswordField ? (
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => setShowPasswordField(true)}
          >
            Register with Password
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary w-full disabled:opacity-60"
            disabled={isSigningUp}
          >
            {isSigningUp ? "Registering..." : "Register"}
          </button>
        )}

        <button
          type="button"
          className="btn btn-secondary w-full disabled:opacity-60"
          onClick={handleOtp}
          disabled={isSendingOtp}
        >
          {isSendingOtp ? "Sending..." : "Register with Phone"}
        </button>

        <button
          type="button"
          onClick={showloginForm}
          className="mt-2 font-bold text-text dark:text-gray-100"
        >
          Already have an account? <br />
          <strong className="text-sage-500">Log In</strong>
        </button>
      </div>

      <Link href="/" className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default Register;