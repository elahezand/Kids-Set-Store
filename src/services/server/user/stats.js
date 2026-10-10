import Order from "@/model/order";
import { countByDay } from "@/services/server/shared/stats";

const getUserStatsTimeseries = async (userId, days = 14) => {
  const rangeDays = Math.min(Math.max(Number(days) || 14, 7), 90);

  const orders = await countByDay(Order, rangeDays, { user: userId });

  return {
    days: rangeDays,
    labels: orders.map((item) => item.day),
    orders: orders.map((item) => item.count),
  };
};

export { getUserStatsTimeseries };

export default {
  getUserStatsTimeseries,
};
