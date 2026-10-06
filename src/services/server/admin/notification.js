import Notification from "@/model/notification";
import User from "@/model/user";

const create = async (data) => {
    const recipient = await User.findById(data.user)
        .select("_id role")
        .lean();

    if (!recipient) {
        return {
            success: false,
            status: 404,
            message: "Admin not found",
        };
    }

    if (!recipient.role?.includes("ADMIN")) {
        return {
            success: false,
            status: 400,
            message: "That user is not an admin",
        };
    }

    const notification = await Notification.create({
        msg: data.msg,
        user: recipient._id,
        link: data.link || null,
    });

    return {
        success: true,
        data: notification,
    };
};

export {
    create,
};

export default {
    create,
};
