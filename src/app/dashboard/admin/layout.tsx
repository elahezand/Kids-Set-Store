import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";
import type { Metadata } from "next";
import { requireAdmin } from "@/utils/auth/panelUser";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { template: "%s | Admin | SET KIDS", default: "Admin | SET KIDS" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, expired } = await requireAdmin();

  return (
    <RefreshAccessToken shouldRefresh={expired}>
      <PanelShell variant="admin" user={user}>
        {children}
      </PanelShell>
    </RefreshAccessToken>
  );
}
