
const logger = require("@/utils/logger");

// required lazily: model/notification -> ... -> model/order -> utils/notify would be circular
const getNotificationModel = () => require("@/model/notification");

const LINKS = Object.freeze({
    userOrders: "/dashboard/orders",
    userTickets: "/dashboard/tickets",
    adminOrders: "/dashboard/admin/orders",
});

const notifyUser = async (userId, msg, { type = "manual", link = null } = {}) => {
    if (!userId || !msg) return null;

    try {
        const Notification = getNotificationModel();
        return await Notification.create({ user: userId, msg, type, link });
    } catch (error) {
        logger.error("[notify] failed to create notification:", error);
        return null;
    }
};

const orderStatusMessage = (orderId, status) =>
    `Your order #${String(orderId).slice(-6).toUpperCase()} status changed to ${status}`;

module.exports = notifyUser;
module.exports.default = notifyUser;
module.exports.notifyUser = notifyUser;
module.exports.orderStatusMessage = orderStatusMessage;
module.exports.NOTIFY_LINKS = LINKS;
