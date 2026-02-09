import connectToDB from "../../../../configs/db";
import UserModel from "../../../../model/user";
import ProductModal from "../../../../model/product";
import TicketModel from "../../../../model/ticket";
import OrderModel from "../../../../model/order";
import styles from "@/styles/p-admin/index.module.css";
import Box from "@/components/modules/box/box";
import Chart from "@/components/template/p-admin/index/chart";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

async function Page() {
    await connectToDB();
    const tickets = await TicketModel.find({})
        .sort({ _id: -1 })
        .limit(8)
        .populate("userID")
        .lean();
    const users = await UserModel.find({}).lean();
    const products = await ProductModal.find({}).lean();
    const orders = await OrderModel.find({}).sort({ _id: -1 }).limit(8).lean();
    return (
        <main className={styles.main}>
            <section className={styles.dashboard_contents}>
                <Box title="ALL Tickets" value={tickets.length} />
                <Box title="ALL Products" value={products.length} />
                <Box title="ALL Orders" value={orders.length} />
                <Box title="ALL Users" value={users.length} />
            </section>

            <div className={styles.dashboard_charts}>
                <section>
                    <p>Sales Data</p>
                    <Chart type="LineChart" />
                </section>
                <section>
                    <p>Growth Rate</p>
                    <Chart type="AreaChart" />
                </section>
            </div>

            <section className={styles.grid_container}>
                <div className={styles.grid_card}>
                    <div className={styles.grid_card_header}>
                        <p>Latest Orders</p>
                        <Link href="/p-admin/orders">
                            All Orders <FaArrowRight />
                        </Link>
                    </div>
                    <table className={styles.grid_table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Date</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.user?.username || "Guest"}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString("en-US")}</td>                                    <td>{order.totalPrice.toLocaleString()} $</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.grid_card}>
                    <div className={styles.grid_card_header}>
                        <p>Latest Tickets</p>
                        <Link href="/p-admin/tickets">
                            All Tickets <FaArrowRight />
                        </Link>
                    </div>
                    <ul className={styles.ticket_list}>
                        {tickets.map((ticket) => (
                            <li key={ticket._id}>
                                <div className={styles.ticket_info}>
                                    <span className={styles.ticket_subject}>{ticket.subject}</span>
                                    <small>{ticket.userID?.username || "Unknown User"}</small>
                                </div>
                                <div className={styles.ticket_meta}>
                                    <span className={ticket.priority >= 3 ? styles.high : styles.low}>
                                        {ticket.priority >= 3 ? 'High' : 'Normal'}
                                    </span>
                                    <span className={styles.status_badge}>{ticket.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </main>
    );
}

export default Page;