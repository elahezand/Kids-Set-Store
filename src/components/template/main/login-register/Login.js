"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";
import Sms from "./Sms";

const PHONE_REGEX = /^09\d{9}$/;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or phone number is required")
    .refine(
      (value) =>
        PHONE_REGEX.test(value) || z.string().email().safeParse(value).success,
      "Enter a valid email or phone number"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

const Login = ({ showRegisterForm }) => {
  const router = useRouter();

  const [showOtp, setShowOtp] = useState(false);
  const [phone, setPhone] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const { mutate: signIn, isPending: isSigningIn } = usePost("/auth/signin", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Login failed",

    onSuccess: () => {
      toast.success("Logged in successfully :)");
      router.replace("/");
      router.refresh();
    },
  });

  const { mutate: sendOtp, isPending: isSendingOtp } = usePost(
    "/auth/sms/send",
    {
      axiosConfig: { silentAuth: true },
      errorFallback: "Failed to send OTP",

      onSuccess: (_, variables) => {
        toast.success("OTP sent successfully :)");
        setPhone(variables.phone);
        setShowOtp(true);
      },
    }
  );

  const onSubmit = ({ identifier, password, remember }) => {
    signIn({ identifier, password, remember });
  };

  const handleOtp = async () => {
    const result = await swal({
      title: "Please enter your phone number",
      content: "input",
      button: { text: "Send OTP" },
    });

    const phoneNumber = result?.trim();
    if (!phoneNumber) return;

    if (!PHONE_REGEX.test(phoneNumber)) {
      toast.error("Invalid Iranian phone number format");
      return;
    }

    sendOtp({ phone: phoneNumber });
  };

  if (showOtp) return <Sms phone={phone} setShowOtp={setShowOtp} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full" noValidate>
      <div className="auth-card">
        <div className="text-left">
          <input
            className="input"
            type="text"
            placeholder="Email | PhoneNumber"
            autoComplete="username"
            {...register("identifier")}
          />
          {errors.identifier && (
            <span className="field-error">{errors.identifier.message}</span>
          )}
        </div>

        <div className="text-left">
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
          <small className="field-hint text-sage-500">
            Include Upper, Lower Case, Number and @
          </small>
        </div>

        <label className="flex cursor-pointer items-center gap-1.5">
          <input type="checkbox" className="checkbox" {...register("remember")} />
          <span className="text-sm">Remember Me</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary w-full disabled:opacity-60"
          disabled={isSigningIn}
        >
          {isSigningIn ? "Signing In..." : "Sign In"}
        </button>

        <Link
          href="/forgotPass"
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          Forgot Password ? :(
        </Link>

        <button
          type="button"
          className="btn btn-secondary w-full disabled:opacity-60"
          onClick={handleOtp}
          disabled={isSendingOtp}
        >
          {isSendingOtp ? "Sending OTP..." : "Login With One-Time Password"}
        </button>

        <button
          type="button"
          onClick={showRegisterForm}
          className="mt-2 font-bold text-text dark:text-gray-100"
        >
          Dont Have Account ? Please <br />
          <strong className="text-sage-500">Sign Up</strong>
        </button>
      </div>

      <Link href="/" className="btn btn-accent mx-auto mt-6 w-max">
        Cancel
      </Link>
    </form>
  );
};

export default Login;