import Comment from "@/model/comment";
import { paginateList } from "@/utils/listQuery";

/* GET /api/admin/comments?status=&productId=&userId=&q=&limit=&cursor= (reviews only, not replies) */
const getAdmin = async (query = {}) =>
    paginateList(Comment, query, {
        base: { parentId: null },
        statuses: ["pending", "approved", "rejected", "spam", "deleted"],
        search: ["body"],
        ids: { productId: "product", userId: "user" },
        populate: [
            { path: "user", select: "username phone" },
            { path: "product", select: "title images" },
        ],
    });


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
            data.rejectReason || null;
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
                reason,
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
