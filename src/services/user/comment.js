import Comment from "@/model/comment";
import Product from "@/model/product";
import Order from "@/model/order";
import { isValidObjectId } from "mongoose";

const create = async (userId, data) => {
    const { product, ...rest } = data;

    if (!isValidObjectId(product)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product",
        };
    }

    const targetProduct = await Product.findById(product).select("_id").lean();

    if (!targetProduct) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    const existingReview = await Comment.findOne({
        user: userId,
        product,
        parentId: null,
        deletedAt: null,
    }).lean();

    if (existingReview) {
        return {
            success: false,
            status: 409,
            message: "You have already reviewed this product",
        };
    }

    const order = await Order.findOne({
        user: userId,
        "items.productId": product,
        $or: [
            { paymentStatus: "paid" },
            { status: "completed" },
        ],
    })
        .sort({ createdAt: -1 })
        .lean();

    if (!order) {
        return {
            success: false,
            status: 403,
            message:
                "You can only review products you have purchased and paid for",
        };
    }

    try {
        const comment = await Comment.create({
            ...rest,
            user: userId,
            product,
            verifiedPurchase: true,
            parentId: null,
        });

        return {
            success: true,
            data: comment,
        };
    } catch (error) {
        if (error.code === 11000) {
            return {
                success: false,
                status: 409,
                message: "You have already reviewed this product",
            };
        }

        throw error;
    }
};

const updateOwn = async (userId, id, data) => {
    const comment = await Comment.findOne({
        _id: id,
        user: userId,
        deletedAt: null,
    });

    if (!comment) {
        return {
            success: false,
            status: 404,
            message: "Comment not found",
        };
    }

    if (comment.status !== "pending") {
        return {
            success: false,
            status: 409,
            message: "Only pending comments can be edited",
        };
    }

    Object.assign(comment, data, {
        editedAt: new Date(),
    });

    const updatedComment = await comment.save();

    return {
        success: true,
        data: updatedComment,
    };
};

const deleteOwn = async (userId, id) => {
    const comment = await Comment.findOneAndUpdate(
        {
            _id: id,
            user: userId,
            deletedAt: null,
        },
        {
            status: "deleted",
            deletedAt: new Date(),
            body: "[deleted]",
        },
        {
            returnDocument: "after",
        }
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
    create,
    updateOwn,
    deleteOwn,
};

export default {
    create,
    updateOwn,
    deleteOwn,
};
