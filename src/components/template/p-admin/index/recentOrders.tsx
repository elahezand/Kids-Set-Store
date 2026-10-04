import Link from "next/link";
import { LuArrowRight, LuShoppingBag } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import { ROUTES } from "@/utils/constants";
import { formatDate, formatPrice } from "@/utils/format";
import { ORDER_STATUS, PAYMENT_STATUS, personName, shortId } from "@/utils/panelView";
import type { AdminOrder } from "@/types";

export default function RecentOrders({ orders }: { orders: AdminOrder[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Latest orders</h2>
        <Link href={ROUTES.admin.orders} className="btn btn-ghost btn-sm">
          All orders <LuArrowRight className="size-3.5" />
        </Link>
      </div>
      {orders.length ? (
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {orders.map((order) => {
            const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.created;
            const payment = PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending;
            return (
              <li key={String(order._id)} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {personName(order.user, "Customer")}
                    <span className="ml-2 font-mono text-xs text-gray-600">{shortId(order._id)}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-700 dark:text-gray-500">
                    <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                    <span className={`badge ${status.badge} py-0 text-[10px]`}>{status.label}</span>
                    <span className={`badge ${payment.badge} py-0 text-[10px]`}>{payment.label}</span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(order.pricing?.total)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No orders yet" description="New orders will show up here." icon={LuShoppingBag} />
      )}
    </section>
  );
}
