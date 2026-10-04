import { redirect } from "next/navigation";
import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";
import { getPanelSession } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import { isAdmin } from "@/utils/role";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { template: "%s | Admin | SET KIDS", default: "Admin | SET KIDS" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, expired } = await getPanelSession();
  if (!user && !expired) redirect(ROUTES.login);
  if (user && !isAdmin(user)) redirect(ROUTES.dashboard.home);

  return (
    <RefreshAccessToken shouldRefresh={expired}>
      <PanelShell variant="admin" user={user}>
        {children}
      </PanelShell>
    </RefreshAccessToken>
  );
}
