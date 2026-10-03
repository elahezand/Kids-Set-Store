"use client";

import Link from "next/link";
import { LuShoppingBag } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import LoadMore from "@/components/modules/main/loadMore";
import StatusTabs from "@/components/modules/panel/statusTabs";
import OrderRow from "@/components/template/p-user/orders/orderRow";
import { useMyOrders } from "@/services/client/panel";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, ORDER_TABS, PAYMENT_STATUS, orderItemsCount, shortId } from "@/utils/panelView";
import type { OrderListItem, OrderStatusFilter, Paginated } from "@/types";

interface OrdersListProps {
  initialPage: Paginated<OrderListItem>;
  limit: number;
  status: OrderStatusFilter;
}

export default function OrdersList({ initialPage, limit, status }: OrdersListProps) {
  const { items: orders, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyOrders(initialPage, limit, status);

  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Order history</h2>
        <StatusTabs tabs={ORDER_TABS} value={status} />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title={status === "all" ? "No orders yet" : "No orders here"}
          description={
            status === "all" ? "Your orders will appear here." : `You have no ${ORDER_STATUS[status].label.toLowerCase()} orders.`
          }
          icon={LuShoppingBag}
          action={
            <Link href="/products" className="btn btn-primary btn-sm">
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          {/* phones */}
          <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
            {orders.map((order) => (
              <li key={String(order._id)}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>

          {/* tablets / desktop */}
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
                  const payment = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending;
                  return (
                    <tr key={String(order._id)}>
                      <td className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {shortId(order._id)}
                      </td>
                      <td className="whitespace-nowrap tabular-nums">{formatDate(order.createdAt)}</td>
                      <td className="tabular-nums">{orderItemsCount(order)}</td>
                      <td>
                        <span className={`badge ${payment.badge}`}>{payment.label}</span>
                        <span className="ml-1.5 text-xs text-gray-600 capitalize">{order.paymentMethod}</span>
                      </td>
                      <td>
                        <span className={`badge ${status.badge}`}>{status.label}</span>
                      </td>
                      <td className="text-right font-semibold whitespace-nowrap tabular-nums">
                        {formatPrice(order.pricing?.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 pb-6">
            <LoadMore
              hasMore={Boolean(hasNextPage)}
              isLoading={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              count={orders.length}
              limit={limit}
              noun="orders"
            />
          </div>
        </>
      )}
    </section>
  );
}
