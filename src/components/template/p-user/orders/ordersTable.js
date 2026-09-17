import Link from "next/link";
import { LuShoppingBag } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";

export default function OrdersTable({ orders = [] }) {
    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Order history</h2>
            </div>
            {orders.length === 0 ? (
                <EmptyState title="No orders yet" description="Your orders will appear here." icon={LuShoppingBag}
                    action={<Link href="/products" className="btn btn-primary btn-sm">Start shopping</Link>} />
            ) : (
                <div className="table-wrap">
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
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">#{String(order._id).slice(-6).toUpperCase()}</td>
                                    <td className="tabular-nums">{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                                    <td>{order.items?.reduce((sum, item) => sum + (item.count || 0), 0) || 0}</td>
                                    <td>
                                        <span className={`badge ${order.isPaid ? "badge-success" : "badge-warning"}`}>{order.isPaid ? "Paid" : "Unpaid"}</span>
                                    </td>
                                    <td><span className="badge badge-neutral capitalize">{order.status}</span></td>
                                    <td className="text-right font-semibold tabular-nums">{order.totalPrice?.toLocaleString()} $</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
