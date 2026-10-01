"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/modules/main/footer";

const NO_FOOTER_ROUTES = ["/login-register", "/forgotPass"];

export default function ShowFooter({ info = null }) {
    const pathname = usePathname();

    if (NO_FOOTER_ROUTES.includes(pathname)) return null;

    return <Footer info={info} />;
}
