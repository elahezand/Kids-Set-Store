import Product from "@/model/product";
import { paginate } from "@/utils/paginate";
import { listLimit } from "@/utils/listQuery";
import { buildProductFilters } from "@/utils/helper";
import invalidateCache from "@/utils/cache";
import { PROTECTED_FIELDS } from "@/services/server/shared/product";
import { isValidObjectId } from "mongoose";
import categoryService from "@/services/server/public/category";
import { calcFinalPrice } from "@/utils/pricing";
import { CATEGORY_LOCKED_ATTRIBUTES, VARIANT_FILTER_SLUGS } from "@/validators/product";

const attributeOf = (variant, key) =>
    variant?.attributes instanceof Map ? variant.attributes.get(key) : variant?.attributes?.[key];

const fail422 = (message) => ({ success: false, status: 422, message });

const specOf = (specs, key) => (specs instanceof Map ? specs.get(key) : specs?.[key]);

/*
 * The product must match its category (the deepest of categoryPath, with the filters it inherits
 * from its parents):
 *  - sizes (CATEGORY_LOCKED_ATTRIBUTES) are options of the category's "size" filter; colors are free
 *  - specs: required filters are filled, select / radio values are options, yes/no is "true"
 *  - finalPrice sent with a variant equals price - discount% (the model stores the same value)
 */
const checkProductAgainstCategory = async ({ categoryPath = [], variants = [], specs = {} }) => {
    for (const variant of variants) {
        if (variant.finalPrice === undefined) continue;
        const expected = calcFinalPrice(variant.price, variant.discount);
        if (Math.abs(Number(variant.finalPrice) - expected) > 0.01) {
            return fail422(`Final price of ${variant.sku || "a variant"} should be ${expected}`);
        }
    }

    const deepest = categoryPath[categoryPath.length - 1];
    if (!deepest) return null;

    const category = await categoryService.getCategoryById(String(deepest?._id ?? deepest));
    if (!category) return fail422("The chosen category doesn't exist");

    return matchCategory(category, { variants, specs });
};

const matchCategory = (category, { variants = [], specs = {} }) => {
    const filters = category.filters || [];
    const isChoice = (f) => ["select", "radio"].includes(f.type) && f.options?.length;
    const hasOption = (f, value) => f.options.some((o) => String(o.value).toLowerCase() === String(value).toLowerCase());

    for (const slug of CATEGORY_LOCKED_ATTRIBUTES) {
        const filter = filters.find((f) => String(f.slug).toLowerCase() === slug && isChoice(f));
        if (!filter) continue;

        const wrong = variants
            .map((variant) => attributeOf(variant, slug))
            .find((value) => value && !hasOption(filter, value));
        if (wrong) return fail422(`${filter.name || slug} "${wrong}" is not an option of ${category.title}`);
    }

    for (const filter of filters) {
        if (VARIANT_FILTER_SLUGS.includes(String(filter.slug).toLowerCase())) continue;

        const value = specOf(specs, filter.slug);
        const empty = value === undefined || value === null || String(value).trim() === "";

        if (empty) {
            if (filter.required) return fail422(`${filter.name} is required for ${category.title}`);
            continue;
        }
        if (filter.type === "boolean" && String(value) !== "true") {
            return fail422(`${filter.name} must be yes or empty`);
        }
        if (isChoice(filter) && !hasOption(filter, value)) {
            return fail422(`"${value}" is not an option of ${filter.name}`);
        }
    }

    return null;
};

const EDITABLE_PRODUCT_STATUSES = [
    "draft",
    "active",
    "inactive",
];

const uploadedPaths = (files = []) =>
    files.map((f) => `/products/images/${f.filename}`);

const pickProductStatus = (status) =>
    EDITABLE_PRODUCT_STATUSES.includes(status)
        ? status
        : undefined;

const getAllProductsAdmin = async (query = {}) => {
    const filters = await buildProductFilters(query, {
        isAdmin: true,
    });

    const limit = listLimit(query, 21, 99);

    return paginate(Product, {
        limit,
        cursor: query.cursor,
        filters,
        populate: "categoryPath",
        sort: {
            _id: -1,
        },
    });
};

const changeStatus = async (id, status) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product id",
        };
    }

    const product = await Product.findById(id);

    if (!product) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    const updated = await Product.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: "after" }
    );

    await invalidateCache("/api/products*");

    return {
        success: true,
        data: updated,
    };
};

const createStoreProduct = async (data, files = []) => {
    const categoryError = await checkProductAgainstCategory(data);
    if (categoryError) return categoryError;

    const payload = {
        ...data,
    };

    payload.images = [
        ...(data.images || []),
        ...uploadedPaths(files),
    ];

    payload.status =
        pickProductStatus(data.status) || "draft";

    const product = await Product.create(payload);

    await invalidateCache("/api/products*");

    return {
        success: true,
        data: product,
    };
};

const updateProduct = async (id, data, files = []) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product id",
        };
    }

    const product = await Product.findById(id);

    if (!product) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    if (data.categoryPath || data.variants || data.specs) {
        const categoryError = await checkProductAgainstCategory({
            categoryPath: data.categoryPath ?? product.categoryPath,
            variants: data.variants ?? product.variants,
            specs: data.specs ?? product.specs,
        });
        if (categoryError) return categoryError;
    }

    const updateData = {
        ...data,
    };

    PROTECTED_FIELDS.forEach((field) => {
        delete updateData[field];
    });

    const status = pickProductStatus(data.status);

    if (status) {
        updateData.status = status;
    }

    if (data.images || files?.length) {
        updateData.images = [
            ...(data.images ?? product.images),
            ...uploadedPaths(files),
        ];
    }

    Object.assign(product, updateData);

    await product.save();

    await invalidateCache("/api/products*");

    return {
        success: true,
        data: {
            product,
            needsReview: false,
        },
    };
};

const deleteProduct = async (id) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product id",
        };
    }

    const product = await Product.findById(id);

    if (!product) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    product.status = "deleted";

    await product.save();

    await invalidateCache("/api/products*");

    return {
        success: true,
    };
};

const getProductPreview = async (id) => {
    if (!isValidObjectId(id)) {
        return {
            success: false,
            status: 400,
            message: "Invalid product id",
        };
    }

    const productData = await Product.findById(id)
        .populate("categoryPath", "_id title slug")
        .lean();

    if (!productData) {
        return {
            success: false,
            status: 404,
            message: "Product not found",
        };
    }

    return {
        success: true,
        data: {
            productData,
            preview: true,
        },
    };
};

export  {
    matchCategory,
    createStoreProduct,
    updateProduct,
    deleteProduct,
    getProductPreview,
    getAllProductsAdmin,
    changeStatus,
};

export default {
    createStoreProduct,
    updateProduct,
    deleteProduct,
    getProductPreview,
    getAllProductsAdmin,
    changeStatus,
};
