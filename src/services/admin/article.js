import Article from "@/model/article";
import { paginate } from "@/utils/paginate";
import { buildListQuery, listLimit } from "@/utils/listQuery";

const getAllArticlesAdmin = async (query = {}) => {
    const limit = listLimit(query, 15);

    const filters = buildListQuery(query, {
        search: ["title"],
    });

    if (query.category) {
        filters.category = query.category;
    }

    if (
        query.isPublished !== undefined &&
        query.isPublished !== "all"
    ) {
        filters.isPublished = query.isPublished === "true";
    }

    return paginate(Article, {
        limit,
        cursor: query.cursor,
        filters,
        populate: {
            path: "category",
            select: "title slug",
        },
        sort: {
            createdAt: -1,
        },
    });
};

const getArticleByIdAdmin = async (id) => {
    const article = await Article.findById(id).populate(
        "category",
        "title slug"
    );

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

const createArticle = async (authorId, data) => {
    const existing = await Article.findOne({
        slug: data.slug,
    });

    if (existing) {
        return {
            success: false,
            status: 409,
            message: "An article with this slug already exists",
        };
    }

    try {
        const article = await Article.create({
            ...data,
            author: authorId,
        });

        return {
            success: true,
            data: article,
        };
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message: "An article with this slug already exists",
            };
        }

        throw err;
    }
};

const updateArticle = async (id, data) => {
    if (data.slug) {
        const existing = await Article.findOne({
            slug: data.slug,
            _id: { $ne: id },
        });

        if (existing) {
            return {
                success: false,
                status: 409,
                message: "An article with this slug already exists",
            };
        }
    }

    try {
        const article = await Article.findByIdAndUpdate(
            id,
            data,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

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
    } catch (err) {
        if (err?.code === 11000) {
            return {
                success: false,
                status: 409,
                message: "An article with this slug already exists",
            };
        }

        throw err;
    }
};

const deleteArticle = async (id) => {
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
        return {
            success: false,
            status: 404,
            message: "Article not found",
        };
    }

    return {
        success: true,
    };
};

export  {
    getAllArticlesAdmin,
    getArticleByIdAdmin,
    createArticle,
    updateArticle,
    deleteArticle,
};

export default {
    getAllArticlesAdmin,
    getArticleByIdAdmin,
    createArticle,
    updateArticle,
    deleteArticle,
};
