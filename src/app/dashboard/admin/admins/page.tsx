import PageHeader from "@/components/modules/panel/pageHeader";
import AdminsList from "@/components/template/p-admin/admins/adminsList";
import userService from "@/services/server/admin/user";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminAccount } from "@/types";

export const metadata: Metadata = { title: "Admins" };

export default async function AdminAdminsPage() {
  const { user } = await requireAdmin();
  const { data } = (await userService.getAdmins()) as { data: AdminAccount[] };
  const admins = toPlain(data).map((admin) => ({ ...admin, _id: String(admin._id) }));

  return (
    <>
      <PageHeader
        title="Admins"
        description={`${admins.length} ${admins.length === 1 ? "person has" : "people have"} access to this panel.`}
      />
      <AdminsList admins={admins} currentUserId={String(user._id)} />
    </>
  );
}
