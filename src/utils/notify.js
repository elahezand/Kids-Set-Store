import Notification from "@/model/notification";
import logger from "@/utils/logger";

const notifyUser = async (
    userId,
    msg,
    { type = "manual", link = null } = {}
) => {
    if (!userId) return;

    try {
        await Notification.create({
            user: userId,
            msg,
            type,
            link,
        });
    } catch (error) {
        logger.error(
            "Failed to create notification:",
            error
        );
    }
};

export default notifyUser;