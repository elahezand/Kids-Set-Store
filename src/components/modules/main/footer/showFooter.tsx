"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/modules/main/footer/footer";
import { ROUTES } from "@/utils/constants";
import type { SiteInfo } from "@/types";

const NO_FOOTER_ROUTES: string[] = [ROUTES.login, ROUTES.forgotPassword];

export default function ShowFooter({ info = null }: { info?: SiteInfo | null }) {
  const pathname = usePathname();

  if (NO_FOOTER_ROUTES.includes(pathname)) return null;

  return <Footer info={info} />;
}
