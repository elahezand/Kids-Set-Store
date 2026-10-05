import PageHeader from "@/components/modules/panel/pageHeader";
import ProductsTable from "@/components/template/p-admin/products/productsTable";
import productService from "@/services/server/admin/product";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { requireAdmin } from "@/utils/auth/panelUser";
import { toInitialPage } from "@/utils/initialPage";
import { PRODUCT_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { AdminProduct, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Products" };

const LIMIT = 15;

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const filters = readAdminFilters(await searchParams, tabValues(PRODUCT_TABS));
  const params = adminListParams.products(LIMIT, filters);

  const result = (await productService.getAllProductsAdmin(params)) as { data: AdminProduct[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Products" description="Create, edit and publish the products of your store." />
      <ProductsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
