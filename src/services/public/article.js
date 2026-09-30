import Article from "@/model/article";
import { paginate } from "@/utils/paginate";
import { escapeRegex } from "@/utils/helper";

const getPublicArticles = async (query = {}) => {
    const limit = Math.min(Number(query.limit) || 15, 100);

    const filters = {
        isPublished: true,
    };

    if (query.category) {
        filters.category = query.category;
    }

    if (query.q) {
        filters.$or = [
            {
                title: {
                    $regex: new RegExp(escapeRegex(query.q), "i"),
                },
            },
            {
                excerpt: {
                    $regex: new RegExp(escapeRegex(query.q), "i"),
                },
            },
        ];
    }

    return paginate(Article, {
        limit,
        cursor: query.cursor,
        filters,
        populate: {
            path: "category",
            select: "title slug",
        },
        select: "-content",
        sort: { _id: -1 },
    });
};

const getPublicArticleById = async (id) => {
    const article = await Article.findOneAndUpdate(
        {
            _id: id,
            isPublished: true,
        },
        {
            $inc: { views: 1 },
        },
        {
            returnDocument: "after",
        }
    ).populate("category", "title slug");

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

export  {
    getPublicArticles,
    getPublicArticleById,
};

export default {
    getPublicArticles,
    getPublicArticleById,
};
