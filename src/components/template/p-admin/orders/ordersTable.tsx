"use client";

import { useState } from "react";
import { LuBanknote, LuClock, LuEye, LuPackageCheck, LuShoppingBag, LuX } from "react-icons/lu";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import OrderDetails from "@/components/template/p-admin/orders/orderDetails";
import { useAdminOrders, useMarkOrderDelivered, useUpdateOrder } from "@/services/client/admin";
import { formatDate, formatPrice } from "@/utils/format";
import {
  ADMIN_ORDER_TABS,
  ORDER_STATUS,
  autoCompleteDate,
  awaitsCash,
  canCancelOrder,
  cashReceivedText,
  orderItemsCount,
  paymentState,
  personName,
  shortId,
} from "@/utils/panelView";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminOrder, AdminOrderStatusFilter, Paginated } from "@/types";

interface OrdersTableProps {
  initialPage: Paginated<AdminOrder>;
  params: AdminListParams;
  filters: AdminFilters<AdminOrderStatusFilter>;
  limit: number;
}

export default function OrdersTable({ initialPage, params, filters, limit }: OrdersTableProps) {
  const { items: orders, ...pager } = useAdminOrders(initialPage, params);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((order) => String(order._id) === openId) ?? null;
  const [cancelId, setCancelId] = useState<string | null>(null);
  const cancel = useUpdateOrder({ onDone: () => setCancelId(null) });
  const [cashId, setCashId] = useState<string | null>(null);
  const cashReceived = useMarkOrderDelivered({ onDone: () => setCashId(null) });

  const badges = (order: AdminOrder) => {
    const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
    const payment = paymentState(order);
    return { status, payment };
  };

  const cashBadges = (order: AdminOrder) =>
    awaitsCash(order) && (
      <>
        {order.isCashOverdue ? (
          <span className="badge badge-danger">
            <LuBanknote className="size-3" /> Cash overdue
          </span>
        ) : (
          <span className="badge badge-warning">
            <LuBanknote className="size-3" /> Collect cash
          </span>
        )}
        {order.isDelivered && (
          <span className="badge badge-neutral">
            <LuPackageCheck className="size-3" /> Customer received
          </span>
        )}
      </>
    );

  /* paid online and shipped: only the customer's "I received it" (or the auto-complete) is left */
  const waitingBadge = (order: AdminOrder) => {
    if (order.status !== "shipped" || order.paymentStatus !== "paid") return null;
    const autoAt = autoCompleteDate(order);
    return (
      <span
        className="badge badge-neutral"
        title={autoAt ? `Completes by itself on ${formatDate(autoAt)} if the customer doesn't confirm` : undefined}
      >
        <LuClock className="size-3" /> Waiting for customer
        {autoAt ? ` · auto ${formatDate(autoAt)}` : ""}
      </span>
    );
  };

  const rowTone = (order: AdminOrder) =>
    awaitsCash(order)
      ? order.isCashOverdue
        ? "bg-danger-50/60 dark:bg-danger-500/5"
        : "bg-peach-50/60 dark:bg-peach-500/5"
      : "";

  const actions = (order: AdminOrder) => (
    <div className="flex flex-wrap justify-end gap-2">
      {awaitsCash(order) && (
        <button type="button" onClick={() => setCashId(String(order._id))} className="btn btn-primary btn-sm">
          <LuBanknote className="size-3.5" /> Cash received
        </button>
      )}
      {canCancelOrder(order) && (
        <button type="button" onClick={() => setCancelId(String(order._id))} className="btn btn-soft-danger btn-sm">
          <LuX className="size-3.5" /> Cancel
        </button>
      )}
      <button type="button" onClick={() => setOpenId(String(order._id))} className="btn btn-secondary btn-sm">
        <LuEye className="size-3.5" /> Details
      </button>
    </div>
  );

  return (
    <>
      <ListCard
        title="All orders"
        toolbar={
          <>
            <StatusTabs tabs={ADMIN_ORDER_TABS} value={filters.status} />
            <SearchBox placeholder="Search order number…" />
          </>
        }
        isEmpty={orders.length === 0}
        empty={
          <EmptyState
            title="No orders found"
            description={filters.q ? `Nothing matches "${filters.q}".` : "Orders with this status will show up here."}
            icon={LuShoppingBag}
          />
        }
        pager={{ ...pager, count: orders.length, limit, noun: "orders" }}
      >
        <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
          {orders.map((order) => {
            const { status, payment } = badges(order);
            return (
              <li key={String(order._id)} className={`space-y-2 px-4 py-4 ${rowTone(order)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {personName(order.user, "Customer")}
                    </p>
                    <p className="font-mono text-xs text-gray-600">
                      {shortId(order._id)} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatPrice(order.pricing?.total)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`badge ${status.badge}`}>{status.label}</span>
                    <span className={`badge ${payment.badge}`}>{payment.label}</span>
                    {cashBadges(order)}
                    {waitingBadge(order)}
                  </div>
                  {actions(order)}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="table-wrap hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const { status, payment } = badges(order);
                return (
                  <tr key={String(order._id)} className={rowTone(order)}>
                    <td className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {shortId(order._id)}
                    </td>
                    <td className="max-w-[180px] truncate">{personName(order.user, "Customer")}</td>
                    <td className="whitespace-nowrap tabular-nums">{formatDate(order.createdAt)}</td>
                    <td className="tabular-nums">{orderItemsCount(order)}</td>
                    <td className="whitespace-nowrap">
                      <span className={`badge ${payment.badge}`}>{payment.label}</span>
                      <span className="ml-1.5 text-xs text-gray-600 capitalize">{order.paymentMethod}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`badge ${status.badge}`}>{status.label}</span>
                        {cashBadges(order)}
                    {waitingBadge(order)}
                      </div>
                    </td>
                    <td className="text-right font-semibold whitespace-nowrap tabular-nums">
                      {formatPrice(order.pricing?.total)}
                    </td>
                    <td>{actions(order)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListCard>

      {open && <OrderDetails order={open} onClose={() => setOpenId(null)} />}

      <ConfirmDialog
        open={cancelId !== null}
        title="Cancel this order?"
        description="Reserved stock goes back to the store and anything already paid is refunded to the customer's wallet. This can't be undone."
        confirmLabel="Cancel order"
        danger
        loading={cancel.isPending}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && cancel.mutate({ id: cancelId, status: "cancelled" })}
      />

      <ConfirmDialog
        open={cashId !== null}
        title="Cash received?"
        description={cashReceivedText(orders.find((order) => String(order._id) === cashId))}
        confirmLabel="Yes, cash received"
        loading={cashReceived.isPending}
        onClose={() => setCashId(null)}
        onConfirm={() => cashId && cashReceived.mutate(cashId)}
      />
    </>
  );
}
