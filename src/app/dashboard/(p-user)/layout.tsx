import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";
import { requirePanelUser } from "@/utils/auth/panelUser";
import type { Metadata } from "next";
import infoService from "@/services/server/public/info";
import type { ReactNode } from "react";
import type { SiteInfo } from "@/types";

export const metadata: Metadata = {
  title: { template: "%s | My Account | SET KIDS", default: "My Account | SET KIDS" },
  robots: { index: false, follow: false },
};

export default async function UserLayout({ children }: { children: ReactNode }) {
  const [{ user, expired }, info] = await Promise.all([requirePanelUser(), infoService.getSiteInfo()]);
  return (
    <RefreshAccessToken shouldRefresh={expired}>
      <PanelShell variant="user" user={user} logo={(info as SiteInfo | null)?.logo}>
        {children}
      </PanelShell>
    </RefreshAccessToken>
  );
}
