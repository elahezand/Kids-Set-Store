import Link from "next/link";
import { LuArrowRight, LuShoppingBag } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";

export default function RecentOrders({ orders = [] }) {
    return (
        <div className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Recent orders</h2>
                <Link href="/p-user/orders" className="btn btn-ghost btn-sm">
                    All orders <LuArrowRight className="size-3.5" />
                </Link>
            </div>
            {orders.length ? (
                <ul className="divide-y divide-gray-200 dark:divide-white/5">
                    {orders.map((order) => (
                        <li key={order._id} className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Order #{String(order._id).slice(-6).toUpperCase()}
                                </p>
                                <p className="mt-1 text-xs text-gray-700 dark:text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString("en-US")} · {order.items?.length || 0} items
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <span className={`badge ${order.isPaid ? "badge-success" : "badge-warning"} capitalize`}>{order.status}</span>
                                <span className="text-sm font-semibold tabular-nums">{order.totalPrice?.toLocaleString()} $</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState title="No orders yet" description="Your orders will appear here." icon={LuShoppingBag}
                    action={<Link href="/products" className="btn btn-primary btn-sm">Start shopping</Link>} />
            )}
        </div>
    );
}
