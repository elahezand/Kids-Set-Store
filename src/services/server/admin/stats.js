import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";
import Ticket from "@/model/ticket";
import Comment from "@/model/comment";
import Contact from "@/model/contact";
import { buildDayBuckets } from "@/services/server/shared/stats";
// registered so populate("department") works
import "@/model/department";

const RECENT_LIMIT = 5;

/* orders that brought money in: paid online, or cash orders that were delivered */
const REVENUE_MATCH = {
    status: { $ne: "cancelled" },
    $or: [{ paymentStatus: "paid" }, { paymentMethod: "cash", status: "completed" }],
};

const startOfDayUTC = (daysAgo = 0) => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo));
};

const sumRevenue = async (match = {}) => {
    const [row] = await Order.aggregate([
        { $match: { ...REVENUE_MATCH, ...match } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
    ]);
    return row?.total || 0;
};

/* /dashboard/admin home: counters + latest orders & tickets (one round trip, all in parallel) */
const getDashboard = async () => {
    const [
        users,
        products,
        orders,
        tickets,
        waitingTickets,
        pendingComments,
        newMessages,
        revenue,
        revenueLast30Days,
        recentOrders,
        recentTickets,
    ] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ status: { $ne: "deleted" } }),
        Order.countDocuments(),
        Ticket.countDocuments({ parent: null }),
        Ticket.countDocuments({ parent: null, isAnswer: false }),
        Comment.countDocuments({ parentId: null, status: "pending" }),
        Contact.countDocuments({ status: "pending" }),
        sumRevenue(),
        sumRevenue({ createdAt: { $gte: startOfDayUTC(29) } }),
        Order.find()
            .sort({ _id: -1 })
            .limit(RECENT_LIMIT)
            .select("user status paymentStatus paymentMethod pricing items.quantity createdAt")
            .populate("user", "username phone")
            .lean(),
        Ticket.find({ parent: null })
            .sort({ _id: -1 })
            .limit(RECENT_LIMIT)
            .select("title priority isAnswer department user createdAt")
            .populate("department", "title")
            .populate("user", "username phone")
            .lean(),
    ]);

    return {
        success: true,
        data: {
            counts: {
                users,
                products,
                orders,
                tickets,
                waitingTickets,
                pendingComments,
                newMessages,
            },
            revenue: { total: revenue, last30Days: revenueLast30Days },
            recentOrders,
            recentTickets,
        },
    };
};

/* GET /api/admin/stat?days=30 — orders, revenue and new users per day */
const getStatsTimeseries = async (days = 30) => {
    const rangeDays = Math.min(Math.max(Number(days) || 30, 7), 365);
    const since = startOfDayUTC(rangeDays - 1);
    const byDay = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

    const [orderRows, revenueRows, userRows] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
            { $group: { _id: byDay, count: { $sum: 1 } } },
        ]),
        Order.aggregate([
            { $match: { ...REVENUE_MATCH, createdAt: { $gte: since } } },
            { $group: { _id: byDay, total: { $sum: "$pricing.total" } } },
        ]),
        User.aggregate([
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: byDay, count: { $sum: 1 } } },
        ]),
    ]);

    const toMap = (rows, field) => new Map(rows.map((row) => [row._id, row[field]]));
    const orders = toMap(orderRows, "count");
    const revenue = toMap(revenueRows, "total");
    const users = toMap(userRows, "count");

    return {
        success: true,
        data: {
            days: rangeDays,
            points: buildDayBuckets(rangeDays).map((day) => ({
                day,
                orders: orders.get(day) || 0,
                revenue: Math.round((revenue.get(day) || 0) * 100) / 100,
                users: users.get(day) || 0,
            })),
        },
    };
};

export { getDashboard, getStatsTimeseries };

export default { getDashboard, getStatsTimeseries };
