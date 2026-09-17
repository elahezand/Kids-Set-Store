import { LuHeart, LuMessageSquare, LuShoppingBag, LuTicket } from "react-icons/lu";
import connectToDB from "../../../../configs/db";
import FavoriteModel from "../../../../model/favorite";
import TicketModel from "../../../../model/ticket";
import CommentModel from "../../../../model/comment";
import OrderModel from "../../../../model/order";
import "../../../../model/department";
import { authUser } from "@/utils/serverHelper";
import PageHeader from "@/components/modules/panel/pageHeader";
import StatCard from "@/components/modules/panel/statCard";
import RecentTickets from "@/components/template/p-user/index/recentTickets";
import RecentOrders from "@/components/template/p-user/index/recentOrders";

export default async function UserDashboard() {
    await connectToDB();
    const user = await authUser();
    const userId = user?._id;

    const [favorite, ticketsCount, commentsCount, ordersCount, tickets, orders] = userId
        ? await Promise.all([
            FavoriteModel.findOne({ user: userId }).select("products").lean(),
            TicketModel.countDocuments({ user: userId, parent: null }),
            CommentModel.countDocuments({ user: userId }),
            OrderModel.countDocuments({ user: userId }),
            TicketModel.find({ user: userId, parent: null }).sort({ _id: -1 }).limit(4).populate("department", "title").lean(),
            OrderModel.find({ user: userId }).sort({ _id: -1 }).limit(4).lean(),
        ])
        : [null, 0, 0, 0, [], []];

    return (
        <>
            <PageHeader
                title={`Welcome back${user?.username ? `, ${user.username}` : ""}`}
                description="Here's a quick look at your account."
            />

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Orders" value={ordersCount} icon={LuShoppingBag} tone="peach" />
                <StatCard title="Tickets" value={ticketsCount} icon={LuTicket} tone="coral" />
                <StatCard title="Comments" value={commentsCount} icon={LuMessageSquare} tone="mint" />
                <StatCard title="Favorites" value={favorite?.products?.length || 0} icon={LuHeart} tone="sage" />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
                <RecentTickets tickets={JSON.parse(JSON.stringify(tickets))} />
                <RecentOrders orders={JSON.parse(JSON.stringify(orders))} />
            </section>
        </>
    );
}
