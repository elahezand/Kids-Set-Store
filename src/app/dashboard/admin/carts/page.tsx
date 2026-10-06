import PageHeader from "@/components/modules/panel/pageHeader";
import CartsTable from "@/components/template/p-admin/carts/cartsTable";
import cartService from "@/services/server/admin/cart";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { CART_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminCart, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Carts" };

const LIMIT = 20;

export default async function AdminCartsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, tabValues(CART_TABS));
  const params = adminListParams.carts(LIMIT, filters);

  const result = (await cartService.getAdminCarts(params)) as { data: AdminCart[]; pagination: Pagination };

  return (
    <>
      <PageHeader
        title="Carts"
        description="What customers have in their carts right now, newest activity first."
      />
      <CartsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
