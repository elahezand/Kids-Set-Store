import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";
import type { Metadata } from "next";
import { requireAdmin } from "@/utils/auth/panelUser";
import infoService from "@/services/server/public/info";
import type { ReactNode } from "react";
import type { SiteInfo } from "@/types";

export const metadata: Metadata = {
  title: { template: "%s | Admin | SET KIDS", default: "Admin | SET KIDS" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [{ user, expired }, info] = await Promise.all([requireAdmin(), infoService.getSiteInfo()]);

  return (
    <RefreshAccessToken shouldRefresh={expired}>
      <PanelShell variant="admin" user={user} logo={(info as SiteInfo | null)?.logo}>
        {children}
      </PanelShell>
    </RefreshAccessToken>
  );
}
