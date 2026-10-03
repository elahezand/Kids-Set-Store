import Link from "next/link";
import { LuArrowRight, LuShoppingBag } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import OrderRow from "@/components/template/p-user/orders/orderRow";
import { ROUTES } from "@/utils/constants";
import type { OrderListItem } from "@/types";

export default function RecentOrders({ orders }: { orders: OrderListItem[] }) {
  return (
    <section className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Recent orders</h2>
        <Link href={ROUTES.dashboard.orders} className="btn btn-ghost btn-sm">
          All orders <LuArrowRight className="size-3.5" />
        </Link>
      </div>
      {orders.length ? (
        <ul className="divide-y divide-gray-200 dark:divide-white/5">
          {orders.map((order) => (
            <li key={String(order._id)}>
              <OrderRow order={order} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No orders yet"
          description="Your orders will appear here."
          icon={LuShoppingBag}
          action={
            <Link href={ROUTES.products} className="btn btn-primary btn-sm">
              Start shopping
            </Link>
          }
        />
      )}
    </section>
  );
}
