import User from "@/model/user";
import Ban from "@/model/ban";
import Session from "@/model/session";
import Order from "@/model/order";
import { paginate } from "@/utils/paginate";
import { buildListQuery, listLimit } from "@/utils/listQuery";
import { revokeAllUserSessions } from "@/services/server/shared/session";

const describeDevice = (userAgent = "") => {
    const browser =
        /Edg\//.test(userAgent)
            ? "Edge"
            : /OPR\/|Opera/.test(userAgent)
                ? "Opera"
                : /Firefox\//.test(userAgent)
                    ? "Firefox"
                    : /Chrome\//.test(userAgent)
                        ? "Chrome"
                        : /Safari\//.test(userAgent)
                            ? "Safari"
                            : null;

    const os =
        /Windows/.test(userAgent)
            ? "Windows"
            : /Android/.test(userAgent)
                ? "Android"
                : /iPhone|iPad|iOS/.test(userAgent)
                    ? "iOS"
                    : /Mac OS X|Macintosh/.test(userAgent)
                        ? "macOS"
                        : /Linux/.test(userAgent)
                            ? "Linux"
                            : null;

    if (!browser && !os) return null;

    return [browser, os].filter(Boolean).join(" on ");
};

const getAllUsers = async (query = {}) => {
    const filters = buildListQuery(query, {
        search: ["name", "username", "phone", "email"],
    });

    // every admin is also a USER -> the "users" tab means "not an admin"
    if (query.role === "ADMIN") filters.role = "ADMIN";
    if (query.role === "USER") filters.role = { $ne: "ADMIN" };

    const result = await paginate(User, {
        limit: listLimit(query, 20, 50),
        cursor: query.cursor,
        filters,
        select: "-password -refreshToken",
        sort: { _id: -1 },
    });

    const userIds = result.data.map((u) => u._id);

    if (!userIds.length) return result;

    const [sessions, orderCounts, bans] = await Promise.all([
        Session.find({ user: { $in: userIds } })
            .select("user userAgent ip lastUsedAt createdAt revokedAt")
            .sort({ lastUsedAt: -1 })
            .lean(),

        Order.aggregate([
            { $match: { user: { $in: userIds } } },
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 },
                },
            },
        ]),

        Ban.find({ phone: { $in: result.data.map((u) => u.phone) } })
            .select("phone")
            .lean(),
    ]);

    const bannedPhones = new Set(bans.map((ban) => ban.phone));

    const lastSession = {};

    for (const session of sessions) {
        const key = String(session.user);

        if (!lastSession[key]) {
            lastSession[key] = session;
        }
    }

    const orders = orderCounts.reduce(
        (acc, order) => ({
            ...acc,
            [String(order._id)]: order.count,
        }),
        {}
    );

    const data = result.data.map((user) => {
        const session = lastSession[String(user._id)];

        return {
            ...user,
            joinedAt: user.createdAt,
            lastLoginAt: session?.lastUsedAt || null,
            lastDevice: session
                ? describeDevice(session.userAgent)
                : null,
            lastIp: session?.ip || null,

            activeSessions: sessions.filter(
                (s) =>
                    String(s.user) === String(user._id) &&
                    !s.revokedAt
            ).length,

            ordersCount: orders[String(user._id)] || 0,
            isBanned: bannedPhones.has(user.phone),
        };
    });

    return {
        data,
        pagination: result.pagination,
    };
};

const getAdmins = async () => {
    const admins = await User.find({ role: "ADMIN" })
        .select("username phone email profilePicture createdAt")
        .sort({ username: 1 })
        .lean();

    return { success: true, data: admins };
};

const postNewUser = async (data) => {
    const { phone, role } = data;

    const isBanUser = await Ban.exists({ phone });

    if (isBanUser) {
        return {
            success: false,
            status: 403,
            message: "User is banned",
        };
    }

    const isUserExist = await User.exists({ phone });

    if (isUserExist) {
        return {
            success: false,
            status: 409,
            message: "User already exists",
        };
    }

    const usersCount = await User.countDocuments();

    const userRole =
        usersCount < 3
            ? ["ADMIN"]
            : Array.isArray(role) && role.length > 0
                ? role
                : ["USER"];

    const newUser = await User.create({
        phone,
        role: userRole,
    });

    return {
        success: true,
        data: newUser,
    };
};

const toggleBan = async (targetUserId) => {
    const user = await User.findById(targetUserId);

    if (!user) {
        return {
            success: false,
            status: 404,
            message: "User not found",
        };
    }

    if (user.role.includes("ADMIN")) {
        return {
            success: false,
            status: 400,
            message: "Cannot ban an ADMIN user",
        };
    }

    const existingBan = await Ban.findOne({ phone: user.phone });

    if (existingBan) {
        await Ban.deleteOne({ phone: user.phone });

        return {
            success: true,
            message: "User unbanned successfully",
        };
    }

    await Ban.create({ phone: user.phone });

    // Kick the banned user out of every device immediately
    await revokeAllUserSessions(user._id, "banned");

    return {
        success: true,
        message: "User banned successfully",
    };
};

const toggleRole = async (targetUserId, adminId) => {
    if (String(targetUserId) === String(adminId)) {
        return {
            success: false,
            status: 400,
            message: "You can't change your own admin role",
        };
    }

    const user = await User.findById(targetUserId);

    if (!user) {
        return {
            success: false,
            status: 404,
            message: "User not found",
        };
    }

    if (user.role.includes("ADMIN")) {
        const adminCount = await User.countDocuments({
            role: "ADMIN",
        });

        if (adminCount <= 1) {
            return {
                success: false,
                status: 400,
                message: "The site needs at least one admin",
            };
        }

        user.role = user.role.filter((r) => r !== "ADMIN");
    } else {
        user.role = [...user.role, "ADMIN"];
    }

    await user.save();

    return {
        success: true,
        data: { role: user.role },
    };
};

const removeUser = async (targetUserId, adminId) => {
    if (String(targetUserId) === String(adminId)) {
        return {
            success: false,
            status: 400,
            message: "You can't delete your own account from here",
        };
    }

    const target = await User.findById(targetUserId)
        .select("role wallet")
        .lean();

    if (!target) {
        return {
            success: false,
            status: 404,
            message: "User not found",
        };
    }

    if (target.role?.includes("ADMIN")) {
        return {
            success: false,
            status: 400,
            message: "Remove the admin role before deleting this user",
        };
    }

    if ((target.wallet?.balance || 0) > 0) {
        return {
            success: false,
            status: 409,
            message:
                "This user still has wallet balance — refund it first",
        };
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);

    if (!deletedUser) {
        return {
            success: false,
            status: 404,
            message: "User not found",
        };
    }

    await revokeAllUserSessions(deletedUser._id, "user_deleted");
    await Session.deleteMany({ user: deletedUser._id });

    return {
        success: true,
    };
};

export {
    getAllUsers,
    getAdmins,
    postNewUser,
    toggleRole,
    toggleBan,
    removeUser,
    describeDevice,
};

export default {
    getAllUsers,
    getAdmins,
    postNewUser,
    toggleRole,
    toggleBan,
    removeUser,
    describeDevice,
};
