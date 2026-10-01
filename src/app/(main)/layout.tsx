import type { ReactNode } from "react";
import ClientLayout from "@/app/(main)/clientLayout";
import AosInit from "@/components/modules/ui/aosInit";

/* Main site shell. The cart lives on the server (services/server/user/cart). */
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AosInit />
      <ClientLayout>{children}</ClientLayout>
    </>
  );
}
