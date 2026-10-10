import { LuBanknote, LuMessageSquare, LuPackage, LuShoppingBag, LuTicket, LuUsers } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import StatCard from "@/components/modules/panel/statCard";
import RecentOrders from "@/components/template/p-admin/index/recentOrders";
import RecentTickets from "@/components/template/p-admin/index/recentTickets";
import SalesChart from "@/components/template/p-admin/index/salesChart";
import statsService from "@/services/server/admin/stats";
import { requireAdmin } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import { formatPrice, toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { AdminDashboard } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const { user } = await requireAdmin();
  const { data } = (await statsService.getDashboard()) as { data: AdminDashboard };
  const { counts, revenue, recentOrders, recentTickets } = toPlain(data);

  return (
    <>
      <PageHeader title={`Hi, ${user.username}`} description="Here's what is happening in your store." />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard
          title="Revenue"
          value={formatPrice(revenue.total)}
          hint={`${formatPrice(revenue.last30Days)} in the last 30 days`}
          icon={LuBanknote}
          tone="brand"
        />
        <StatCard title="Orders" value={counts.orders} icon={LuShoppingBag} tone="sun" href={ROUTES.admin.orders} />
        <StatCard title="Products" value={counts.products} icon={LuPackage} tone="sky" href={ROUTES.admin.products} />
        <StatCard title="Users" value={counts.users} icon={LuUsers} tone="brand" href={ROUTES.admin.users} />
        <StatCard
          title="Tickets"
          value={counts.tickets}
          hint={counts.waitingTickets ? `${counts.waitingTickets} waiting for a reply` : "All answered"}
          icon={LuTicket}
          tone="coral"
          href={`${ROUTES.admin.tickets}?status=waiting`}
        />
        <StatCard
          title="Comments to review"
          value={counts.pendingComments}
          icon={LuMessageSquare}
          tone="sun"
          href={`${ROUTES.admin.comments}?status=pending`}
        />
      </section>

      <div className="mt-6">
        <SalesChart />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <RecentOrders orders={recentOrders} />
        <RecentTickets tickets={recentTickets} />
      </section>
    </>
  );
}
