"use client";

import { useState } from "react";
import { LuEye, LuShoppingCart, LuTrash2 } from "react-icons/lu";
import DateRangeFilter from "@/components/modules/panel/dateRangeFilter";
import ListCard from "@/components/modules/panel/listCard";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import CartDetails from "@/components/template/p-admin/carts/cartDetails";
import { useAdminCarts, useDeleteCart } from "@/services/client/admin";
import { CART_TABS, cartState, personName, timeAgo } from "@/utils/panelView";
import { filteredEmptyText } from "@/utils/adminFilters";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminCart, AdminCartStatusFilter, Paginated } from "@/types";

interface CartsTableProps {
  initialPage: Paginated<AdminCart>;
  params: AdminListParams;
  filters: AdminFilters<AdminCartStatusFilter>;
  limit: number;
}

const itemsCount = (cart: AdminCart) => cart.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

const productTitles = (cart: AdminCart) => {
  const titles = cart.items
    .map((item) => (item.productId && typeof item.productId === "object" ? item.productId.title : null))
    .filter(Boolean) as string[];
  if (!titles.length) return "Empty";
  return titles.length > 2 ? `${titles.slice(0, 2).join(", ")} +${titles.length - 2} more` : titles.join(", ");
};

export default function CartsTable({ initialPage, params, filters, limit }: CartsTableProps) {
  const { items: carts, ...pager } = useAdminCarts(initialPage, params);
  const [opened, setOpened] = useState<AdminCart | null>(null);
  const [deleting, setDeleting] = useState<AdminCart | null>(null);
  const remove = useDeleteCart({ onDone: () => setDeleting(null) });

  const owner = (cart: AdminCart) => {
    const user = typeof cart.user === "object" ? cart.user : null;
    return (
      <div className="min-w-0 leading-tight">
        <p className="truncate font-medium text-gray-900 dark:text-gray-100">{personName(user, "Unknown")}</p>
        {user?.phone && <p className="truncate text-xs text-gray-700 tabular-nums dark:text-gray-500">{user.phone}</p>}
      </div>
    );
  };

  const actions = (cart: AdminCart) => (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        onClick={() => setOpened(cart)}
        className="btn btn-soft-primary btn-sm btn-icon"
        aria-label="View cart"
        title="View"
      >
        <LuEye className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setDeleting(cart)}
        className="btn btn-soft-danger btn-sm btn-icon"
        aria-label="Delete cart"
        title="Delete"
      >
        <LuTrash2 className="size-3.5" />
      </button>
    </div>
  );

  return (
    <>
      <ListCard
        title="Shopping carts"
        toolbar={
          <>
            <StatusTabs tabs={CART_TABS} value={filters.status} />
            <DateRangeFilter value={filters} label="Last activity" />
          </>
        }
        isEmpty={carts.length === 0}
        empty={
          <EmptyState
            title="No carts"
            description={filteredEmptyText(filters) ?? "Carts appear as soon as a signed-in customer adds something."}
            icon={LuShoppingCart}
          />
        }
        pager={{ ...pager, count: carts.length, limit, noun: "carts" }}
      >
        <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
          {carts.map((cart) => {
            const state = cartState(cart.status);
            return (
              <li key={String(cart._id)} className="space-y-2 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  {owner(cart)}
                  <span className={`badge ${state.badge}`}>{state.label}</span>
                </div>
                <p className="line-clamp-2 text-xs text-gray-700 dark:text-gray-500">{productTitles(cart)}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-700 dark:text-gray-500">
                    {itemsCount(cart)} items · {timeAgo(cart.updatedAt)}
                  </span>
                  {actions(cart)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="table-wrap hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Products</th>
                <th>Items</th>
                <th>Status</th>
                <th>Last change</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => {
                const state = cartState(cart.status);
                return (
                  <tr key={String(cart._id)}>
                    <td>{owner(cart)}</td>
                    <td className="max-w-xs truncate text-sm">{productTitles(cart)}</td>
                    <td className="tabular-nums">{itemsCount(cart)}</td>
                    <td>
                      <span className={`badge ${state.badge}`}>{state.label}</span>
                    </td>
                    <td className="text-xs whitespace-nowrap">{timeAgo(cart.updatedAt)}</td>
                    <td>{actions(cart)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListCard>

      {opened && (
        <CartDetails
          cart={opened}
          onClose={() => setOpened(null)}
          onDelete={() => {
            setDeleting(opened);
            setOpened(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this cart?"
        description="The customer's cart is emptied. Their orders are not affected."
        confirmLabel="Delete"
        danger
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(String(deleting._id))}
      />
    </>
  );
}
