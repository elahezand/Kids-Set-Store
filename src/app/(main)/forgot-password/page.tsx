import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/template/main/forgot-password/forgotPasswordForm";
import { getMe } from "@/utils/auth/authGuard";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password | SET KIDS",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  if (await getMe()) redirect(ROUTES.dashboard.home);
  return <ForgotPasswordForm />;
}
