import { redirect } from "next/navigation";
import { authUser } from "@/utils/serverHelper";
import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";

export default async function UserLayout({ children }) {
    const user = await authUser();
    if (!user) redirect("/login-register");

    const isExpired = user.status === "expired";
    const safeUser = isExpired ? null : JSON.parse(JSON.stringify(user));

    return (
        <RefreshAccessToken shouldRefresh={isExpired}>
            <PanelShell variant="user" user={safeUser}>
                {children}
            </PanelShell>
        </RefreshAccessToken>
    );
}
