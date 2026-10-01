import Article from "@/model/article";
import Category from "@/model/category";
import { isValidObjectId } from "mongoose";
import paginate from "@/utils/paginate";
import { listLimit } from "@/utils/listQuery";

const escapeRegex = (text) =>
    String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const getPublicArticles = async (query = {}) => {
    const limit = listLimit(query, 15, 50);

    const filters = {
        isPublished: true,
    };

    const category = String(query.category ?? "").trim();

    if (category) {
        if (isValidObjectId(category)) {
            filters.category = category;
        } else {
            const categoryDoc = await Category.findOne({ slug: category })
                .select("_id")
                .lean();

            if (!categoryDoc) {
                return {
                    data: [],
                    pagination: { hasMore: false, nextCursor: null },
                };
            }

            filters.category = categoryDoc._id;
        }
    }

    const q = String(query.q ?? "").trim().slice(0, 100);

    if (q) {
        const regex = new RegExp(escapeRegex(q), "i");

        filters.$or = [
            { title: { $regex: regex } },
            { excerpt: { $regex: regex } },
        ];
    }

    return paginate(Article, {
        limit,
        cursor: query.cursor,
        filters,
        sort: { _id: -1 },
        populate: [
            { path: "category", select: "title slug" },
            { path: "author", select: "name username" },
        ],
        select: "-content",
    });
};

/* Categories that really have published articles (filter on /articles) */
const getPublicArticleCategories = async () => {
    const ids = await Article.distinct("category", {
        isPublished: true,
        category: { $ne: null },
    });

    if (!ids.length) return [];

    const categories = await Category.find({ _id: { $in: ids } })
        .select("title slug")
        .sort({ title: 1 })
        .lean();

    return categories.map(({ title, slug }) => ({ title, slug }));
};

const safeDecode = (value) => {
    try {
        return decodeURIComponent(value);
    } catch {
        return String(value);
    }
};

const getPublicArticleById = async (idOrSlug) => {
    const filter = isValidObjectId(idOrSlug)
        ? { _id: idOrSlug }
        : { slug: safeDecode(idOrSlug).toLowerCase() };

    const article = await Article.findOneAndUpdate(
        {
            ...filter,
            isPublished: true,
        },
        {
            $inc: { views: 1 },
        },
        {
            returnDocument: "after",
        }
    )
        .populate("category", "title slug")
        .populate("author", "name username")
        .lean();

    if (!article) {
        return {
            success: false,
            status: 404,
            message: "Article not found",
        };
    }

    return {
        success: true,
        data: article,
    };
};

const getOtherPublicArticles = async (excludeId, limit = 4) => {
    return Article.find({
        _id: { $ne: excludeId },
        isPublished: true,
    })
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .select("title slug")
        .lean();
};

export default {
    getPublicArticles,
    getPublicArticleCategories,
    getPublicArticleById,
    getOtherPublicArticles,
};