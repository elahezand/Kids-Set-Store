import Comment from "@/model/comment";
import { paginateList } from "@/utils/listQuery";

const getAdmin = async (query = {}) => {
    const filters =
        query.replied === "true"
            ? { _id: { $in: await Comment.distinct("parentId", { parentId: { $ne: null }, status: { $ne: "deleted" } }) } }
            : {};

    const result = await paginateList(Comment, query, {
        filters,
        // deleted reviews are hidden unless ?status=deleted asks for them
        base: { parentId: null, status: { $ne: "deleted" } },
        statuses: ["pending", "approved", "rejected", "spam", "deleted"],
        search: ["body"],
        ids: { productId: "product", userId: "user" },
        populate: [
            { path: "user", select: "username phone" },
            { path: "product", select: "title images" },
        ],
    });

    const ids = (result.data ?? []).map((comment) => comment._id);
    if (!ids.length) return result;

    const replies = await Comment.find({ parentId: { $in: ids }, status: { $ne: "deleted" } })
        .sort({ createdAt: 1 })
        .populate("user", "username")
        .select("parentId body user createdAt")
        .lean();

    const byParent = new Map();
    for (const reply of replies) {
        const key = String(reply.parentId);
        byParent.set(key, [...(byParent.get(key) ?? []), reply]);
    }

    return {
        ...result,
        data: result.data.map((comment) => ({ ...comment, replies: byParent.get(String(comment._id)) ?? [] })),
    };
};

const replyToComment = async (adminId, parentId, body) => {
    const parent = await Comment.findById(parentId);

    if (!parent || parent.deletedAt) {
        return {
            success: false,
            status: 404,
            message: "Comment not found",
        };
    }

    if (parent.parentId) {
        return {
            success: false,
            status: 409,
            message:
                "You can only reply to a review, not to a reply",
        };
    }

    if (["rejected", "spam"].includes(parent.status)) {
        return {
            success: false,
            status: 409,
            message:
                "Approve this comment before replying to it",
        };
    }

    if (parent.status === "pending") {
        parent.status = "approved";

        parent.moderation = {
            moderatedBy: adminId,
            moderatedAt: new Date(),
            reason: null,
        };

        await parent.save();
    }

    // one public reply per review — delete it to write a new one
    const alreadyReplied = await Comment.exists({ parentId: parent._id, status: { $ne: "deleted" } });
    if (alreadyReplied) {
        return {
            success: false,
            status: 409,
            message: "This review already has a reply — delete it first to write a new one",
        };
    }

    const reply = await Comment.create({
        user: adminId,
        product: parent.product,
        parentId: parent._id,
        body,
        status: "approved",
    });

    await reply.populate("user", "name username");

    return {
        success: true,
        data: reply,
    };
};

const moderate = async (id, adminId, data) => {
    const update = {
        status: data.status,
        "moderation.moderatedBy": adminId,
        "moderation.moderatedAt": new Date(),
    };

    if (
        data.status === "rejected" ||
        data.status === "spam"
    ) {
        update["moderation.rejectReason"] =
            data.reason || data.rejectReason || null;
    }

    if (data.status === "deleted") {
        update.deletedAt = new Date();
        update.body = "[deleted]";
        update.status = "deleted";
    }

    const comment = await Comment.findByIdAndUpdate(
        id,
        update,
        { new: true }
    );

    if (!comment) {
        return {
            success: false,
            status: 404,
            message: "Comment not found",
        };
    }

    return {
        success: true,
        data: comment,
    };
};

const adminDelete = async (id, adminId, reason) => {
    const now = new Date();

    const comment = await Comment.findOneAndUpdate(
        {
            _id: id,
            deletedAt: null,
        },
        {
            status: "deleted",
            deletedAt: now,
            deletedBy: adminId,
            body: "[deleted]",
            moderation: {
                moderatedBy: adminId,
                moderatedAt: now,
                rejectReason: reason || null,
            },
        },
        { new: true }
    );

    if (!comment) {
        return {
            success: false,
            status: 404,
            message: "Comment not found",
        };
    }

    return {
        success: true,
        data: comment,
    };
};

export {
    getAdmin,
    replyToComment,
    moderate,
    adminDelete,
};

export default {
    getAdmin,
    replyToComment,
    moderate,
    adminDelete,
};