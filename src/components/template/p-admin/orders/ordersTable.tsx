"use client";

import { useState } from "react";
import { LuEye, LuShoppingBag } from "react-icons/lu";
import ListCard from "@/components/modules/panel/listCard";
import SearchBox from "@/components/modules/panel/searchBox";
import StatusTabs from "@/components/modules/panel/statusTabs";
import EmptyState from "@/components/modules/ui/emptyState";
import OrderDetails from "@/components/template/p-admin/orders/orderDetails";
import { useAdminOrders } from "@/services/client/admin";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, ORDER_TABS, orderItemsCount, PAYMENT_STATUS, personName, shortId } from "@/utils/panelView";
import type { AdminFilters, AdminListParams } from "@/utils/adminFilters";
import type { AdminOrder, OrderStatusFilter, Paginated } from "@/types";

interface OrdersTableProps {
  initialPage: Paginated<AdminOrder>;
  params: AdminListParams;
  filters: AdminFilters<OrderStatusFilter>;
  limit: number;
}

export default function OrdersTable({ initialPage, params, filters, limit }: OrdersTableProps) {
  const { items: orders, ...pager } = useAdminOrders(initialPage, params);
  const [openId, setOpenId] = useState<string | null>(null);
  // the modal reads the order from the list, so it shows fresh data after every change
  const open = orders.find((order) => String(order._id) === openId) ?? null;

  const badges = (order: AdminOrder) => {
    const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
    const payment = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending;
    return { status, payment };
  };

  const viewButton = (order: AdminOrder) => (
    <button type="button" onClick={() => setOpenId(String(order._id))} className="btn btn-secondary btn-sm">
      <LuEye className="size-3.5" /> Details
    </button>
  );

  return (
    <>
      <ListCard
        title="All orders"
        toolbar={
          <>
            <StatusTabs tabs={ORDER_TABS} value={filters.status} />
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
              <li key={String(order._id)} className="space-y-2 px-4 py-4">
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
                    {order.isCashOverdue && <span className="badge badge-danger">Cash overdue</span>}
                  </div>
                  {viewButton(order)}
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
                  <tr key={String(order._id)}>
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
                      <span className={`badge ${status.badge}`}>{status.label}</span>
                      {order.isCashOverdue && <span className="badge badge-danger ml-1.5">Cash overdue</span>}
                    </td>
                    <td className="text-right font-semibold whitespace-nowrap tabular-nums">
                      {formatPrice(order.pricing?.total)}
                    </td>
                    <td>
                      <div className="flex justify-end">{viewButton(order)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ListCard>

      {open && <OrderDetails order={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
