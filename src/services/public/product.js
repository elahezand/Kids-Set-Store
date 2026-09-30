import { isValidObjectId } from "mongoose";
import Product from "@/model/product";
import {
    paginate,
    buildProductFilters,
} from "@/utils/helper";
import logger from "@/utils/logger";
import { findProductForDetail } from "@/services/shared/product";

/* === GET ALL (PUBLIC) === */
const getAllProducts = async (query = {}) => {
    const filters = await buildProductFilters(query);

    const limit = query.limit
        ? Number(query.limit)
        : 99;

    return paginate(Product, {
        limit,
        cursor: query.cursor,
        filters,
        populate: [
            {
                path: "categoryPath",
                select: "_id title slug",
            },
        ],
        sort: { _id: -1 },
    });
};

/* === GET BY ID (PUBLIC) === */
const getProductById = async (id) => {
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

    if (budget) {
        query.price = {
            $lte: Number(budget),
        };
    }

    const products = await Product.find(query)
        .select("title price categoryPath")
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

export {
    getAllProducts,
    getProductById,
    smartSearch,
};

export default {
    getAllProducts,
    getProductById,
    smartSearch,
};
