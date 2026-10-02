import type { Metadata } from "next";
import PageHeader from "@/components/modules/panel/pageHeader";
import OrdersList from "@/components/template/p-user/orders/ordersList";
import orderService from "@/services/server/user/order";
import { getPanelSession } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import type { OrderListItem, Pagination } from "@/types";

export const metadata: Metadata = { title: "Orders" };

const LIMIT = 10;

export default async function OrdersPage() {
  const { user } = await getPanelSession();
  if (!user) return null;

  const result = (await orderService.getMyOrders(user._id, { limit: LIMIT })) as {
    data: OrderListItem[];
    pagination: Pagination;
  };

  return (
    <>
      <PageHeader title="Orders" description="Track your purchases and their status." />
      <OrdersList initialPage={toInitialPage(result, LIMIT)} limit={LIMIT} />
    </>
  );
}
