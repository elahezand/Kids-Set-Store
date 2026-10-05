"use client";

import { useState } from "react";
import Link from "next/link";
import { LuEye, LuPackageCheck, LuShoppingBag, LuWallet, LuX } from "react-icons/lu";
import LoadMore from "@/components/modules/main/loadMore";
import StatusTabs from "@/components/modules/panel/statusTabs";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import OrderDetails from "@/components/template/p-user/orders/orderDetails";
import EmptyState from "@/components/modules/ui/emptyState";
import OrderRow from "@/components/template/p-user/orders/orderRow";
import { useCancelMyOrder, useConfirmDelivery, useMyOrders } from "@/services/client/panel";
import { ROUTES } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { autoCompleteDate, ORDER_STATUS, ORDER_TABS, orderItemsCount, paymentState, shortId } from "@/utils/panelView";
import type { OrderListItem, OrderStatusFilter, Paginated } from "@/types";

interface OrdersListProps {
  initialPage: Paginated<OrderListItem>;
  limit: number;
  status: OrderStatusFilter;
}

export default function OrdersList({ initialPage, limit, status }: OrdersListProps) {
  const { items: orders, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyOrders(initialPage, limit, status);
  const [confirming, setConfirming] = useState<OrderListItem | null>(null);
  const [cancelling, setCancelling] = useState<OrderListItem | null>(null);
  const confirm = useConfirmDelivery({ onDone: () => setConfirming(null) });
  const cancel = useCancelMyOrder({ onDone: () => setCancelling(null) });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((order) => String(order._id) === openId) ?? null;

  const detailsButton = (order: OrderListItem) => (
    <button type="button" onClick={() => setOpenId(String(order._id))} className="btn btn-secondary btn-sm">
      <LuEye className="size-3.5" /> Details
    </button>
  );

  const orderActions = (order: OrderListItem, compact = false) => {
    const align = compact ? "items-end text-right" : "items-start";

    if (order.status === "shipped" && order.paymentMethod === "cash" && order.isDelivered) {
      return (
        <span
          className={`flex items-center gap-1 text-xs text-gray-700 dark:text-gray-400 ${compact ? "justify-end" : ""}`}
        >
          <LuPackageCheck className="size-3.5" /> Received · waiting for payment confirmation
        </span>
      );
    }

    if (order.status === "shipped") {
      const autoAt = order.paymentStatus === "paid" ? autoCompleteDate(order) : null;
      return (
        <div className={`flex flex-col gap-1 ${align}`}>
          <button type="button" onClick={() => setConfirming(order)} className="btn btn-soft-primary btn-sm">
            <LuPackageCheck className="size-3.5" /> I received it
          </button>
          {autoAt && <span className="text-[11px] text-gray-600">Completes automatically on {formatDate(autoAt)}</span>}
        </div>
      );
    }

    if (order.status === "created" || order.status === "processing") {
      return (
        <div className={`flex flex-col ${align}`}>
          <button type="button" onClick={() => setCancelling(order)} className="btn btn-soft-danger btn-sm">
            <LuX className="size-3.5" /> Cancel order
          </button>
        </div>
      );
    }

    if (order.status === "cancelled" && order.refundAmount) {
      return (
        <span
          className={`flex items-center gap-1 text-xs text-sage-700 dark:text-sage-300 ${compact ? "justify-end" : ""}`}
        >
          <LuWallet className="size-3.5" /> {formatPrice(order.refundAmount)} refunded to your wallet
        </span>
      );
    }

    return null;
  };

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
            status === "all"
              ? "Your orders will appear here."
              : `You have no ${ORDER_STATUS[status].label.toLowerCase()} orders.`
          }
          icon={LuShoppingBag}
          action={
            <Link href={ROUTES.products} className="btn btn-primary btn-sm">
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          <ul className="divide-y divide-gray-200 md:hidden dark:divide-white/5">
            {orders.map((order) => (
              <li key={String(order._id)}>
                <OrderRow
                  order={order}
                  action={
                    <div className="flex flex-wrap items-start gap-2">
                      {orderActions(order)}
                      {detailsButton(order)}
                    </div>
                  }
                />
              </li>
            ))}
          </ul>

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
                  <th className="text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
                  const payment = paymentState(order);
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
                      <td>
                        <div className="flex items-start justify-end gap-2">
                          {orderActions(order, true)}
                          {detailsButton(order)}
                        </div>
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

      {open && <OrderDetails order={open} actions={orderActions(open, true)} onClose={() => setOpenId(null)} />}

      <ConfirmDialog
        open={Boolean(cancelling)}
        title="Cancel this order?"
        description={
          cancelling
            ? cancelling.paymentStatus === "paid" || cancelling.pricing?.walletUsed
              ? `Order ${shortId(cancelling._id)} will be cancelled and what you paid goes back to your wallet.`
              : `Order ${shortId(cancelling._id)} will be cancelled.`
            : undefined
        }
        confirmLabel="Cancel order"
        danger
        loading={cancel.isPending}
        onClose={() => setCancelling(null)}
        onConfirm={() => cancelling && cancel.mutate(String(cancelling._id))}
      />

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Did you receive this order?"
        description={
          confirming
            ? confirming.paymentMethod === "cash" && confirming.paymentStatus !== "paid"
              ? `Order ${shortId(confirming._id)} is marked as received. It completes once the store confirms your cash payment.`
              : `Order ${shortId(confirming._id)} will be marked as completed.`
            : undefined
        }
        confirmLabel="Yes, I received it"
        loading={confirm.isPending}
        onClose={() => setConfirming(null)}
        onConfirm={() => confirming && confirm.mutate(String(confirming._id))}
      />
    </section>
  );
}
