import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import StuckOrders from "@/components/template/p-admin/orders/stuckOrders";
import orderService from "@/services/server/admin/order";
import { requireAdmin } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminOrder, OrderSweepStatus } from "@/types";

export const metadata: Metadata = { title: "Order checks" };

export default async function AdminStuckOrdersPage() {
  await requireAdmin();
  const [stuck, status] = await Promise.all([orderService.getStuckOrders(), orderService.getSweepStatus()]);

  return (
    <>
      <PageHeader
        title="Order checks"
        description="Orders the automatic checks finish, complete or flag, and the ones that need a hand."
        actions={
          <Link href={ROUTES.admin.orders} className="btn btn-secondary btn-sm">
            <LuArrowLeft className="size-4" /> All orders
          </Link>
        }
      />
      <StuckOrders
        orders={toPlain((stuck as { data: AdminOrder[] }).data)}
        status={toPlain(status as OrderSweepStatus)}
      />
    </>
  );
}
