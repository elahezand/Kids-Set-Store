import User from "@/model/user";
import Order from "@/model/order";

import { countByDay } from "@/services/shared/stats";

const getAdminStats = async () => {
    const [totalUsers, totalOrders] =
        await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
        ]);

    return {
        success: true,
        data: {
            totalUsers,
            totalOrders,
        },
    };
};

const getAdminStatsTimeseries = async (days = 14) => {
    const rangeDays = Math.min(
        Math.max(Number(days) || 14, 7),
        90
    );

    const [orders, users] = await Promise.all([
        countByDay(Order, rangeDays),
        countByDay(User, rangeDays),
    ]);

    return {
        success: true,
        data: {
            days: rangeDays,
            labels: orders.map((r) => r.day),
            orders: orders.map((r) => r.count),
            newUsers: users.map((r) => r.count),
        },
    };
};

export  {
    getAdminStats,
    getAdminStatsTimeseries,
};