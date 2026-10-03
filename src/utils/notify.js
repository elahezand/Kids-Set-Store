
const logger = require("@/utils/logger");

// required lazily: model/notification -> ... -> model/order -> utils/notify would be circular
const getNotificationModel = () => require("@/model/notification");

/** Where a user sees a notification in the main site / panel */
const LINKS = Object.freeze({
    userOrders: "/dashboard/orders",
    userTickets: "/dashboard/tickets",
    adminOrders: "/p-admin",
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

/** Same message to several users (e.g. every admin) */
const notifyUsers = async (userIds = [], msg, options) =>
    Promise.all([...new Set(userIds.map(String))].map((id) => notifyUser(id, msg, options)));

/** "Your order #A1B2C3 status changed to shipped" */
const orderStatusMessage = (orderId, status) =>
    `Your order #${String(orderId).slice(-6).toUpperCase()} status changed to ${status}`;

module.exports = notifyUser;
module.exports.default = notifyUser;
module.exports.notifyUser = notifyUser;
module.exports.notifyUsers = notifyUsers;
module.exports.orderStatusMessage = orderStatusMessage;
module.exports.NOTIFY_LINKS = LINKS;
