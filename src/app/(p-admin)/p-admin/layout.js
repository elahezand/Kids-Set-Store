import { redirect } from "next/navigation";
import { authAdmin } from "@/utils/serverHelper";
import PanelShell from "@/components/modules/panel/panelShell";
import RefreshAccessToken from "@/components/modules/ui/refreshAccessToken";

export default async function AdminLayout({ children }) {
    const admin = await authAdmin();
    if (!admin) redirect("/login-register");

    const isExpired = admin.status === "expired";
    const user = isExpired ? null : JSON.parse(JSON.stringify(admin));

    return (
        <RefreshAccessToken shouldRefresh={isExpired}>
            <PanelShell variant="admin" user={user}>
                {children}
            </PanelShell>
        </RefreshAccessToken>
    );
}
