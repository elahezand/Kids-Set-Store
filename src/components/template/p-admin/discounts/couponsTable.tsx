"use client";

import { useState } from "react";
import { LuBadgePercent, LuPlus, LuTrash2 } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import CouponForm from "@/components/template/p-admin/discounts/couponForm";
import { useAdminCoupons, useDeleteCoupon, useUpdateCoupon } from "@/services/client/admin";
import { formatDate, formatPrice } from "@/utils/format";
import { COUPON_TABS, couponState } from "@/utils/panelView";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { Coupon, CouponStatusFilter, Paginated } from "@/types";

interface CouponsTableProps {
  initialPage: Paginated<Coupon>;
  params: AdminListParams;
  filters: AdminFilters<CouponStatusFilter>;
  limit: number;
}

const valueText = (coupon: Coupon) =>
  coupon.type === "percent"
    ? `${coupon.amount}%${coupon.maxDiscount ? ` (max ${formatPrice(coupon.maxDiscount)})` : ""}`
    : formatPrice(coupon.amount);

const datesText = (coupon: Coupon) => {
  if (!coupon.startsAt && !coupon.expiresAt) return "No end date";
  if (!coupon.expiresAt) return `From ${formatDate(coupon.startsAt)}`;
  return coupon.startsAt
    ? `${formatDate(coupon.startsAt)} – ${formatDate(coupon.expiresAt)}`
    : `Until ${formatDate(coupon.expiresAt)}`;
};

export default function CouponsTable({ initialPage, params, filters, limit }: CouponsTableProps) {
  const { items: coupons, ...pager } = useAdminCoupons(initialPage, params);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const update = useUpdateCoupon();
  const remove = useDeleteCoupon();

  const usage = (coupon: Coupon) => {
    const used = coupon.usedCount || 0;
    const percent = coupon.usageLimit ? Math.min(100, Math.round((used / coupon.usageLimit) * 100)) : 0;
    return (
      <div className="flex items-center gap-2">
        {coupon.usageLimit != null && (
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-sage-500" style={{ width: `${percent}%` }} />
          </div>
        )}
        <span className="text-xs tabular-nums">
          {used}
          {coupon.usageLimit != null ? `/${coupon.usageLimit}` : " used"}
        </span>
      </div>
    );
  };

  const actions = (coupon: Coupon) => (
    <div className="flex items-center gap-2">
      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-700 dark:text-gray-400">
        <input
          type="checkbox"
          checked={coupon.isActive}
          disabled={update.isPending}
          onChange={(event) => update.mutate({ id: String(coupon._id), isActive: event.target.checked })}
          className="checkbox"
          aria-label={coupon.isActive ? `Disable ${coupon.code}` : `Enable ${coupon.code}`}
        />
        Enabled
      </label>
      <button
        type="button"
        onClick={() => setDeleting(coupon)}
        className="btn btn-soft-danger btn-sm btn-icon"
        aria-label={`Delete ${coupon.code}`}
        title="Delete"
      >
        <LuTrash2 className="size-3.5" />
      </button>
    </div>
  );

  const code = (coupon: Coupon) => (
    <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-900 dark:bg-white/5 dark:text-gray-100">
      {coupon.code}
    </code>
  );

  return (
    <>
      <ListCard
        title="Discount codes"
        toolbar={
          <>
            <StatusTabs tabs={COUPON_TABS} value={filters.status} />
            <DateRangeFilter value={filters} label="Created" />
            <SearchBox placeholder="Search codes…" />
            <button type="button" onClick={() => setCreating(true)} className="btn btn-primary btn-sm">
              <LuPlus className="size-4" /> New code
            </button>
          </>
        }
        isEmpty={coupons.length === 0}
        empty={
          <EmptyState
            title="No discount codes"
            description={filteredEmptyText(filters) ?? "Create a code to run a promotion."}
            icon={LuBadgePercent}
            action={
              <button type="button" onClick={() => setCreating(true)} className="btn btn-primary btn-sm">
                <LuPlus className="size-4" /> New code
              </button>
            }
          />
        }
        pager={{ ...pager, count: coupons.length, limit, noun: "codes" }}
      >
        <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
          {coupons.map((coupon) => {
            const state = couponState(coupon);
            return (
              <li key={String(coupon._id)} className="space-y-2 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  {code(coupon)}
                  <span className={`badge ${state.badge}`}>{state.label}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-500">
                  {valueText(coupon)} · {datesText(coupon)}
                </p>
                <div className="flex items-center justify-between gap-2">
                  {usage(coupon)}
                  {actions(coupon)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="table-wrap hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Valid</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const state = couponState(coupon);
                return (
                  <tr key={String(coupon._id)}>
                    <td>{code(coupon)}</td>
                    <td className="font-medium whitespace-nowrap tabular-nums">{valueText(coupon)}</td>
                    <td>{usage(coupon)}</td>
                    <td className="text-xs whitespace-nowrap">{datesText(coupon)}</td>
                    <td>
                      <span className={`badge ${state.badge}`}>{state.label}</span>
                    </td>
                    <td>
                      <div className="flex justify-end">{actions(coupon)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListCard>

      {creating && <CouponForm onClose={() => setCreating(false)} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.code ?? "this code"}?`}
        description="Customers can't use it any more. Orders that already used it keep their discount."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(String(deleting._id), { onSuccess: () => setDeleting(null) })}
      />
    </>
  );
}
