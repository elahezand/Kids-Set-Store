import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/template/main/forgot-password/forgotPasswordForm";
import { getMe } from "@/utils/auth/authGuard";

export const metadata: Metadata = {
  title: "Reset password | SET KIDS",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  if (await getMe()) redirect("/p-user");
  return <ForgotPasswordForm />;
}
