import { redirect } from "next/navigation";
import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";
import { getPanelSession } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { template: "%s | My Account | SET KIDS", default: "My Account | SET KIDS" },
  robots: { index: false, follow: false },
};

export default async function UserLayout({ children }: { children: ReactNode }) {
  const { user, expired } = await getPanelSession();
  if (!user && !expired) redirect(ROUTES.login);

  return (
    <RefreshAccessToken shouldRefresh={expired}>
      <PanelShell variant="user" user={user}>
        {children}
      </PanelShell>
    </RefreshAccessToken>
  );
}
