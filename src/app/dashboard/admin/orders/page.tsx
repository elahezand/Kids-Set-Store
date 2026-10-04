import PageHeader from "@/components/modules/panel/pageHeader";
import OrdersTable from "@/components/template/p-admin/orders/ordersTable";
import orderService from "@/services/server/admin/order";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { toInitialPage } from "@/utils/initialPage";
import { ORDER_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminOrder, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Orders" };

const LIMIT = 15;

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const filters = readAdminFilters(await searchParams, tabValues(ORDER_TABS));
  const params = adminListParams.orders(LIMIT, filters);

  const result = (await orderService.getAllOrders(params)) as { data: AdminOrder[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Orders" description="Follow every order from payment to delivery." />
      <OrdersTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
