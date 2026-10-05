import Article from "@/model/article";
import { paginateList } from "@/utils/listQuery";
import slugify from "@/utils/slugify";

const resolveSlug = async (title, wanted, excludeId = null) => {
    const base = slugify(wanted || title) || `article-${Date.now()}`;
    const taken = async (slug) =>
        Article.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });

    if (wanted) return (await taken(base)) ? null : base;

    let slug = base;
    for (let i = 2; await taken(slug); i++) slug = `${base}-${i}`;
    return slug;
};

const getAllArticlesAdmin = async (query = {}) => {
    const filters = {};

    if (query.category) filters.category = query.category;

    if (query.isPublished !== undefined && query.isPublished !== "all") {
        filters.isPublished = query.isPublished === "true";
    }

    return paginateList(Article, query, {
        defaultLimit: 15,
        search: ["title"],
        filters,
        select: "-content",
        populate: [
            { path: "category", select: "title slug" },
            { path: "author", select: "username" },
        ],
        sort: { createdAt: -1 },
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
    const slug = await resolveSlug(data.title, data.slug);

    if (!slug) {
        return {
            success: false,
            status: 409,
            message: "An article with this slug already exists",
        };
    }

    try {
        const article = await Article.create({
            ...data,
            slug,
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
        const slug = await resolveSlug(data.title, data.slug, id);

        if (!slug) {
            return {
                success: false,
                status: 409,
                message: "An article with this slug already exists",
            };
        }

        data = { ...data, slug };
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
