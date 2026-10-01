import { redirect } from "next/navigation";
import AuthForms from "@/components/template/main/login-register/authForms";
import { getMe } from "@/utils/auth/authGuard";

export const metadata = {
    title: "Log in / Sign up | SET KIDS",
    robots: { index: false, follow: false },
};

// already logged in -> nothing to do here
export default async function LoginRegisterPage() {
    const user = await getMe();
    if (user) redirect("/p-user");

    return <AuthForms />;
}
