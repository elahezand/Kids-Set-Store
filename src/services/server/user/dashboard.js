import Favorite from "@/model/favorite";
import Ticket from "@/model/ticket";
import Comment from "@/model/comment";
import Order from "@/model/order";
import "@/model/department";

const RECENT_LIMIT = 4;

const getDashboard = async (userId) => {
  const [orders, tickets, comments, favorites, recentTickets, recentOrders] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Ticket.countDocuments({ user: userId, parent: null }),
    Comment.countDocuments({ user: userId, deletedAt: null }),
    Favorite.countDocuments({ user: userId }),
    Ticket.find({ user: userId, parent: null })
      .sort({ _id: -1 })
      .limit(RECENT_LIMIT)
      .select("title priority isAnswer department createdAt")
      .populate("department", "title")
      .lean(),
    Order.find({ user: userId })
      .sort({ _id: -1 })
      .limit(RECENT_LIMIT)
      .select("status paymentStatus paymentMethod pricing items.quantity createdAt")
      .lean(),
  ]);

  return {
    success: true,
    data: {
      counts: { orders, tickets, comments, favorites },
      recentTickets,
      recentOrders,
    },
  };
};

export { getDashboard };

export default { getDashboard };
