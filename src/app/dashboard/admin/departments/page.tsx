import PageHeader from "@/components/modules/panel/pageHeader";
import DepartmentsManager from "@/components/template/p-admin/departments/departmentsManager";
import departmentService from "@/services/server/admin/department";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminDepartmentOverview } from "@/types";

export const metadata: Metadata = { title: "Ticket departments" };

export default async function AdminDepartmentsPage() {
  await requireAdmin();
  const departments = toPlain(
    (await departmentService.getDepartmentsOverview()) as AdminDepartmentOverview[]
  );

  return (
    <>
      <PageHeader
        title="Ticket departments"
        description="The teams and topics customers choose from when they open a support ticket."
      />
      <DepartmentsManager departments={departments} />
    </>
  );
}
