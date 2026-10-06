import PageHeader from "@/components/modules/panel/pageHeader";
import OrdersInTransit from "@/components/template/p-user/orders/ordersInTransit";
import OrdersList from "@/components/template/p-user/orders/ordersList";
import orderService from "@/services/server/user/order";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { toPlain } from "@/utils/format";
import { ORDER_TABS, tabValues } from "@/utils/panelView";
import { pickStatus } from "@/utils/searchParams";
import type { Metadata } from "next";
import type { OrderListItem, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Orders" };

const LIMIT = 10;

export default async function OrdersPage({ searchParams }: PageProps) {
  const { user } = await getPanelSession();
  if (!user) return null;

  const status = pickStatus(await searchParams, tabValues(ORDER_TABS));

  const [list, shipped] = await Promise.all([
    orderService.getMyOrders(user._id, {
      limit: LIMIT,
      ...(status !== "all" && { status }),
    }),
    // shipped orders always show on top, whatever tab is open
    orderService.getMyOrders(user._id, { limit: 20, status: "shipped" }),
  ]);
  const result = list as { data: OrderListItem[]; pagination: Pagination };
  const inTransit = toPlain((shipped as { data: OrderListItem[] }).data ?? []);

  return (
    <>
      <PageHeader title="Orders" description="Track your purchases and their status." />
      <OrdersInTransit orders={inTransit} />
      <OrdersList key={status} status={status} initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </>
  );
}
