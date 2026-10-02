import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, PAYMENT_STATUS, orderItemsCount, shortId } from "@/utils/panelView";
import type { OrderListItem } from "@/types";

/* one order as a compact card — used on phones and in the dashboard "Recent orders" */
export default function OrderRow({ order }: { order: OrderListItem }) {
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
  const payment = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending;
  const count = orderItemsCount(order);

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{shortId(order._id)}</p>
        <p className="mt-1 text-xs text-gray-700 dark:text-gray-500">
          {formatDate(order.createdAt)} · {count} {count === 1 ? "item" : "items"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={`badge ${status.badge}`}>{status.label}</span>
          <span className={`badge ${payment.badge}`}>{payment.label}</span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(order.pricing?.total)}</span>
    </div>
  );
}
