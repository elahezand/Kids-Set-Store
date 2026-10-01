"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  ApiSuccess,
  ResetPasswordPayload,
  SendOtpPayload,
  SendOtpResult,
  SessionUser,
  SignInPayload,
  SignUpPayload,
  VerifyOtpPayload,
} from "@/types";
import { usePost } from "./query";


type UserResponse = ApiSuccess<{ user: SessionUser }>;

const useAfterLogin = (message: string, redirectTo = "/") => {
  const router = useRouter();
  return () => {
    toast.success(message);
    router.replace(redirectTo);
    router.refresh();
  };
};

export const useSignIn = () =>
  usePost<UserResponse, SignInPayload>("/auth/signin", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Login failed",
    onSuccess: useAfterLogin("Logged in successfully :)"),
  });

export const useSignUp = () =>
  usePost<UserResponse, SignUpPayload>("/auth/signup", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Sign up failed",
    onSuccess: useAfterLogin("Signed up successfully :)"),
  });

export const useSendOtp = ({
  onSent,
  message = "Code sent successfully :)",
}: { onSent?: (phone: string, result?: SendOtpResult) => void; message?: string } = {}) =>
  usePost<ApiSuccess<SendOtpResult>, SendOtpPayload>("/auth/sms/send", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Failed to send code",
    onSuccess: (response, variables) => {
      toast.success(message);
      onSent?.(variables.phone, response.data);
    },
  });

export const useVerifyOtp = () =>
  usePost<UserResponse, VerifyOtpPayload>("/auth/sms/verify", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Invalid verification code",
    onSuccess: useAfterLogin("Logged in successfully :)"),
  });

export const useResetPassword = () => {
  const router = useRouter();

  return usePost<ApiSuccess, ResetPasswordPayload>("/reset-password", {
    axiosConfig: { skipRefresh: true },
    errorFallback: "Failed to reset password",
    onSuccess: () => {
      toast.success("Password reset successfully!");
      router.replace("/login-register");
    },
  });
};
