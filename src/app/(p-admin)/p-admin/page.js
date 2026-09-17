import Link from "next/link";
import { LuArrowRight, LuPackage, LuShoppingBag, LuTicket, LuUsers } from "react-icons/lu";
import connectToDB from "../../../../configs/db";
import UserModel from "../../../../model/user";
import ProductModel from "../../../../model/product";
import TicketModel from "../../../../model/ticket";
import OrderModel from "../../../../model/order";
import PageHeader from "@/components/modules/panel/pageHeader";
import StatCard from "@/components/modules/panel/statCard";
import EmptyState from "@/components/modules/ui/emptyState";
import Chart from "@/components/template/p-admin/index/chart";

export default async function AdminDashboard() {
    await connectToDB();

    const [ticketsCount, usersCount, productsCount, ordersCount, latestTickets, latestOrders] = await Promise.all([
        TicketModel.countDocuments({ parent: null }),
        UserModel.countDocuments({}),
        ProductModel.countDocuments({}),
        OrderModel.countDocuments({}),
        TicketModel.find({ parent: null }).sort({ _id: -1 }).limit(6).populate("user", "username email").lean(),
        OrderModel.find({}).sort({ _id: -1 }).limit(6).populate("user", "username").lean(),
    ]);

    const tickets = JSON.parse(JSON.stringify(latestTickets));
    const orders = JSON.parse(JSON.stringify(latestOrders));

    return (
        <>
            <PageHeader title="Dashboard" description="Overview of your store activity." />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Total tickets" value={ticketsCount} icon={LuTicket} tone="coral" />
                <StatCard title="Total products" value={productsCount} icon={LuPackage} tone="sage" />
                <StatCard title="Total orders" value={ordersCount} icon={LuShoppingBag} tone="peach" />
                <StatCard title="Total users" value={usersCount} icon={LuUsers} tone="mint" />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Sales data</h2>
                    </div>
                    <div className="card-body">
                        <Chart type="LineChart" />
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Growth rate</h2>
                    </div>
                    <div className="card-body">
                        <Chart type="BarChart" />
                    </div>
                </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="card overflow-hidden">
                    <div className="card-header">
                        <h2 className="card-title">Latest orders</h2>
                    </div>
                    {orders.length ? (
                        <div className="table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td className="font-medium text-gray-900 dark:text-gray-100">{order.user?.username || "Guest"}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                                            <td><span className={`badge ${order.isPaid ? "badge-success" : "badge-warning"} capitalize`}>{order.status}</span></td>
                                            <td className="text-right tabular-nums">{order.totalPrice?.toLocaleString()} $</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState title="No orders yet" icon={LuShoppingBag} />
                    )}
                </div>

                <div className="card overflow-hidden">
                    <div className="card-header">
                        <h2 className="card-title">Latest tickets</h2>
                        <Link href="/p-admin/tickets" className="btn btn-ghost btn-sm">
                            View all <LuArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    {tickets.length ? (
                        <ul className="divide-y divide-gray-200 dark:divide-white/5">
                            {tickets.map((ticket) => (
                                <li key={ticket._id}>
                                    <Link href={`/p-admin/tickets/${ticket._id}`} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{ticket.title}</p>
                                            <p className="truncate text-xs text-gray-700 dark:text-gray-500">{ticket.user?.username || ticket.user?.email || "Unknown user"}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className={`badge ${ticket.priority >= 3 ? "badge-danger" : "badge-neutral"}`}>
                                                {ticket.priority >= 3 ? "High" : "Normal"}
                                            </span>
                                            <span className={`badge ${ticket.isAnswer ? "badge-success" : "badge-accent"}`}>
                                                {ticket.isAnswer ? "Answered" : "Open"}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState title="No tickets yet" icon={LuTicket} />
                    )}
                </div>
            </section>
        </>
    );
}
