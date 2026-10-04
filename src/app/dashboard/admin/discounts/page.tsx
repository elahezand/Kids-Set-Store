import PageHeader from "@/components/modules/panel/pageHeader";
import CouponsTable from "@/components/template/p-admin/discounts/couponsTable";
import couponService from "@/services/server/admin/coupon";
import { adminListParams, filtersKey, readAdminFilters } from "@/utils/adminFilters";
import { toInitialPage } from "@/utils/initialPage";
import { COUPON_TABS, tabValues } from "@/utils/panelView";
import type { Metadata } from "next";
import type { Coupon, PageProps, Pagination } from "@/types";

export const metadata: Metadata = { title: "Discounts" };

const LIMIT = 20;

export default async function AdminDiscountsPage({ searchParams }: PageProps) {
  const filters = readAdminFilters(await searchParams, tabValues(COUPON_TABS));
  const params = adminListParams.coupons(LIMIT, filters);

  const result = (await couponService.getCoupons(params)) as { data: Coupon[]; pagination: Pagination };

  return (
    <>
      <PageHeader title="Discounts" description="Discount codes customers can apply in the cart." />
      <CouponsTable
        key={filtersKey(filters)}
        filters={filters}
        params={params}
        initialPage={toInitialPage(result, LIMIT)}
        limit={LIMIT}
      />
    </>
  );
}
