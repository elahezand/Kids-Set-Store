import { LuHeart, LuMessageSquare, LuShoppingBag, LuTicket } from "react-icons/lu";
import PageHeader from "@/components/modules/panel/pageHeader";
import StatCard from "@/components/modules/panel/statCard";
import RecentOrders from "@/components/template/p-user/index/recentOrders";
import RecentTickets from "@/components/template/p-user/index/recentTickets";
import WalletCard from "@/components/template/p-user/index/walletCard";
import dashboardService from "@/services/server/user/dashboard";
import walletService from "@/services/server/user/wallet";
import { getPanelSession } from "@/utils/auth/panelUser";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import type { Metadata } from "next";
import type { UserDashboard, WalletSummary, WalletTransaction } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function UserDashboardPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const [{ data }, wallet] = await Promise.all([
    dashboardService.getDashboard(user._id) as Promise<{ data: UserDashboard }>,
    walletService.getMyWallet(user._id, { limit: 5 }) as Promise<{
      data?: WalletTransaction[];
      meta?: WalletSummary;
    }>,
  ]);
  const { counts, recentTickets, recentOrders } = toPlain(data);
  const walletSummary: WalletSummary = toPlain(
    wallet.meta ?? { balance: user.wallet?.balance ?? 0, totals: { refunded: 0, spent: 0 } }
  );

  return (
    <>
      <PageHeader title={`Welcome back, ${user.username}`} description="Here's a quick look at your account." />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Orders"
          value={counts.orders}
          icon={LuShoppingBag}
          tone="peach"
          href={ROUTES.dashboard.orders}
        />
        <StatCard title="Tickets" value={counts.tickets} icon={LuTicket} tone="coral" href={ROUTES.dashboard.tickets} />
        <StatCard
          title="Comments"
          value={counts.comments}
          icon={LuMessageSquare}
          tone="mint"
          href={ROUTES.dashboard.comments}
        />
        <StatCard
          title="Favorites"
          value={counts.favorites}
          icon={LuHeart}
          tone="sage"
          href={ROUTES.dashboard.favorites}
        />
      </section>

      <div className="mt-6">
        <WalletCard wallet={walletSummary} transactions={toPlain(wallet.data ?? [])} />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <RecentOrders orders={recentOrders} />
        <RecentTickets tickets={recentTickets} />
      </section>
    </>
  );
}
