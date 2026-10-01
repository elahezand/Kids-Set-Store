import Article from "@/model/article";
import Category from "@/model/category";
import { isValidObjectId } from "mongoose";

const escapeRegex = (text) =>
    String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

/* Local cursor pagination (sorted by _id desc), same result shape as before:
   { data, pagination: { hasMore, nextCursor } }
   Replace with the shared utils/paginate once that file is fixed. */
const paginateById = async (
    Model,
    { limit, cursor, filters = {}, populate, select }
) => {
    const query = { ...filters };

    if (cursor && isValidObjectId(cursor)) {
        query._id = { $lt: cursor };
    }

    let mongooseQuery = Model.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1);

    if (select) mongooseQuery = mongooseQuery.select(select);
    if (populate) mongooseQuery = mongooseQuery.populate(populate);

    const docs = await mongooseQuery.lean();

    const hasMore = docs.length > limit;
    const data = hasMore ? docs.slice(0, limit) : docs;

    return {
        data,
        pagination: {
            hasMore,
            nextCursor: hasMore ? String(data[data.length - 1]._id) : null,
        },
    };
};

const getPublicArticles = async (query = {}) => {
    const limit = Math.min(Math.max(Number(query.limit) || 15, 1), 100);

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

    return paginateById(Article, {
        limit,
        cursor: query.cursor,
        filters,
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