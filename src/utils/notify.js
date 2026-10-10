import logger from "@/utils/logger";
import Notification from "@/model/notification";

const LINKS = Object.freeze({
  userOrders: "/dashboard/orders",
  userTickets: "/dashboard/tickets",
  adminOrders: "/dashboard/admin/orders",
});

const notifyUser = async (userId, msg, { type = "manual", link = null } = {}) => {
  if (!userId || !msg) return null;

  try {
    return await Notification.create({ user: userId, msg, type, link });
  } catch (error) {
    logger.error("[notify] failed to create notification:", error);
    return null;
  }
};

const orderStatusMessage = (orderId, status) =>
  `Your order #${String(orderId).slice(-6).toUpperCase()} status changed to ${status}`;

export { notifyUser, orderStatusMessage, LINKS as NOTIFY_LINKS };

export default notifyUser;
