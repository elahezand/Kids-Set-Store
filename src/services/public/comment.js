import Comment from "@/model/comment";
import { paginate } from "@/utils/paginate";
import { isValidObjectId } from "mongoose";

const PUBLIC_USER_FIELDS = "_id name username profilePicture";

const getByProduct = async (product, query = {}) => {
    if (!isValidObjectId(product)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product",
        };
    }

    const filters = {
        product,
        parentId: null,
        status: "approved",
        deletedAt: null,
    };

    const parents = await paginate(Comment, {
        limit: Math.min(Math.max(Number(query.limit) || 10, 1), 50),
        cursor: query.cursor,
        filters,
        populate: {
            path: "user",
            select: PUBLIC_USER_FIELDS,
        },
        sort: { _id: -1 },
    });

    const parentIds = parents.data.map((p) => p._id);

    const replies = parentIds.length
        ? await Comment.find({
              product,
              parentId: { $in: parentIds },
              status: "approved",
              deletedAt: null,
          })
              .sort({ createdAt: 1 })
              .populate("user", PUBLIC_USER_FIELDS)
              .lean()
        : [];

    const byParent = new Map();

    for (const reply of replies) {
        const parentId = String(reply.parentId);

        if (!byParent.has(parentId)) {
            byParent.set(parentId, []);
        }

        byParent.get(parentId).push(reply);
    }

    const data = parents.data.map((parent) => ({
        ...parent,
        replies: byParent.get(String(parent._id)) || [],
    }));

    return {
        success: true,
        data,
        pagination: parents.pagination,
    };
};

const countByProduct = async (product) => {
    if (!isValidObjectId(product)) {
        return 0;
    }

    return Comment.countDocuments({
        product,
        parentId: null,
        status: "approved",
        deletedAt: null,
    });
};

const commentService = {
    getByProduct,
    countByProduct,
};

export default commentService;