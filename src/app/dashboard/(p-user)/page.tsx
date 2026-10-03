import type { Metadata } from "next";
import { LuHeart, LuMessageSquare, LuShoppingBag, LuTicket } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import StatCard from "@/components/modules/panel/statCard";
import RecentTickets from "@/components/template/p-user/index/recentTickets";
import RecentOrders from "@/components/template/p-user/index/recentOrders";
import dashboardService from "@/services/server/user/dashboard";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toPlain } from "@/utils/format";
import type { UserDashboard } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function UserDashboardPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const { data } = (await dashboardService.getDashboard(user._id)) as { data: UserDashboard };
  const { counts, recentTickets, recentOrders } = toPlain(data);

  return (
    <>
      <PageHeader title={`Welcome back, ${user.username}`} description="Here's a quick look at your account." />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Orders" value={counts.orders} icon={LuShoppingBag} tone="peach" href="/p-user/orders" />
        <StatCard title="Tickets" value={counts.tickets} icon={LuTicket} tone="coral" href="/p-user/tickets" />
        <StatCard title="Comments" value={counts.comments} icon={LuMessageSquare} tone="mint" href="/p-user/comments" />
        <StatCard title="Favorites" value={counts.favorites} icon={LuHeart} tone="sage" href="/p-user/favorites" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <RecentOrders orders={recentOrders} />
        <RecentTickets tickets={recentTickets} />
      </section>
    </>
  );
}
