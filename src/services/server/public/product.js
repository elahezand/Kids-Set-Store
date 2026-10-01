import { isValidObjectId } from "mongoose";
import Product from "@/model/product";
import {
    paginate,
    buildProductFilters,
} from "@/utils/helper";
import logger from "@/utils/logger";
import { findProductForDetail } from "@/services/server/shared/product";

/* Fields a product card / list needs (detail page loads everything) */
const LIST_FIELDS =
    "title slug images minPrice price variants metrics status categoryPath tags shortIdentifier createdAt";

/* ?sort= values the shop understands. _id is added by paginate as a tie-breaker. */
const SORTS = {
    latest: { _id: -1 },
    price: { minPrice: 1 },
    "price-desc": { minPrice: -1 },
    popularity: { "metrics.score": -1 },
    bestSelling: { "metrics.sold": -1 },
};

const clampLimit = (value, fallback = 12, max = 50) =>
    Math.min(Math.max(Number(value) || fallback, 1), max);

// ?value=bestSelling | latest (old links in the footer / home page) maps to a sort
const resolveSort = (query = {}) =>
    SORTS[query.sort] || SORTS[query.value] || SORTS.latest;

/* === GET ALL (PUBLIC) === */
const getAllProducts = async (query = {}) => {
    const filters = await buildProductFilters(query);

    return paginate(Product, {
        limit: clampLimit(query.limit, 12, 99),
        cursor: query.cursor,
        filters,
        select: LIST_FIELDS,
        populate: [
            {
                path: "categoryPath",
                select: "_id title slug",
            },
        ],
        sort: resolveSort(query),
    });
};

/* Home page sections */
const getLatestProducts = async (limit = 10) => {
    const { data } = await getAllProducts({ limit, sort: "latest" });
    return data;
};

const getBestSellingProducts = async (limit = 10) => {
    const { data } = await getAllProducts({ limit, sort: "bestSelling" });
    return data;
};

/* Same category, newest first (product page "Related products") */
const getRelatedProducts = async (product, limit = 5) => {
    if (!product?._id) return [];

    const categoryIds = (product.categoryPath ?? []).map((c) => c?._id ?? c);

    return Product.find({
        status: "active",
        _id: { $ne: product._id },
        ...(categoryIds.length ? { categoryPath: { $in: categoryIds } } : {}),
    })
        .select(LIST_FIELDS)
        .sort({ _id: -1 })
        .limit(clampLimit(limit, 5, 20))
        .lean();
};

/* === GET BY ID (PUBLIC) === */
const getProductById = async (id, { countView = false } = {}) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product id",
        };
    }

    const productData = await findProductForDetail(id);

    if (!productData || productData.status !== "active") {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    if (countView) {
        // fire and forget: a failed counter must not break the page
        Product.updateOne({ _id: id }, { $inc: { "metrics.views": 1 } }).catch(
            (err) => logger.error("[product] could not count view:", err)
        );
    }

    return {
        success: true,
        data: productData,
    };
};

/* === SMART SEARCH (AI SEARCH) === */
const smartSearch = async ({ prompt, budget }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            status: 500,
            message:
                "OpenRouter API key is missing on the server",
        };
    }

    const query = {
        status: "active",
    };

    // minPrice = cheapest variant (the field the shop filters on)
    if (budget) {
        query.minPrice = {
            $lte: Number(budget),
        };
    }

    const products = await Product.find(query)
        .select("title minPrice categoryPath")
        .populate("categoryPath", "title")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    if (!products.length) {
        return {
            success: true,
            data: null,
            reason:
                "No active products found matching the budget.",
        };
    }

    const simplifiedPosts = products.map((item) => ({
        _id: item._id,
        title: item.title,
        price: item.minPrice ?? 0,
        category: Array.isArray(item.categoryPath)
            ? item.categoryPath
                .map((c) => c.title)
                .join(" > ")
            : item.categoryPath?.title || "",
    }));

    const systemPrompt = `You are an AI search assistant.
Analyze the available products and match the user's request.
Return ONLY a valid JSON object without markdown formatting.
JSON Structure:
{
  "_id": "the_matching_post_id_or_null",
  "reason": "Short explanation in English explaining why this product matches"
}

Available products: ${JSON.stringify(simplifiedPosts)}`;

    let response;

    try {
        response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "X-Title": "Marketplace AI Search",
                },
                body: JSON.stringify({
                    model: "openrouter/auto",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: `Query: "${String(
                                prompt
                            ).slice(0, 500)}" ${budget
                                ? `| Budget limit: ${budget}`
                                : ""
                                }`,
                        },
                    ],
                    temperature: 0.1,
                }),
                signal: AbortSignal.timeout(20000),
            }
        );
    } catch (err) {
        logger.error(
            "OpenRouter request failed:",
            err
        );

        return {
            success: false,
            status: 502,
            message:
                "Failed to communicate with AI service.",
        };
    }

    if (!response.ok) {
        logger.error(
            "OpenRouter Error:",
            response.status,
            await response.text()
        );

        return {
            success: false,
            status: 502,
            message:
                "Failed to communicate with AI service.",
        };
    }

    const data = await response.json();

    const content =
        data.choices?.[0]?.message?.content;

    if (!content) {
        return {
            success: true,
            data: null,
            reason:
                "No matching product found for your request.",
        };
    }

    try {
        const cleanContent = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleanContent);

        const isKnownId = simplifiedPosts.some(
            (p) =>
                String(p._id) === String(parsed._id)
        );

        if (!parsed._id || !isKnownId) {
            return {
                success: true,
                data: null,
                reason:
                    parsed.reason ||
                    "No matching product found.",
            };
        }

        return {
            success: true,
            data: {
                _id: parsed._id,
            },
            reason: parsed.reason,
        };
    } catch (error) {
        logger.error(
            "Failed to parse AI response:",
            content
        );

        return {
            success: true,
            data: null,
            reason:
                "Failed to parse search results from AI.",
        };
    }
};

const productService = {
    getAllProducts,
    getLatestProducts,
    getBestSellingProducts,
    getRelatedProducts,
    getProductById,
    smartSearch,
};

export {
    getAllProducts,
    getLatestProducts,
    getBestSellingProducts,
    getRelatedProducts,
    getProductById,
    smartSearch,
};

export default productService;
