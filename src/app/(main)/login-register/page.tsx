import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AuthForms from "@/components/template/main/login-register/authForms";
import { getMe } from "@/utils/auth/authGuard";

export const metadata: Metadata = {
  title: "Log in / Sign up | SET KIDS",
  robots: { index: false, follow: false },
};

export default async function LoginRegisterPage() {
  if (await getMe()) redirect("/p-user");
  return <AuthForms />;
}
