import Product from "@/model/product";
import { paginate } from "@/utils/paginate";
import { buildProductFilters } from "@/utils/helper";
import invalidateCache from "@/utils/cache";
import { PROTECTED_FIELDS } from "@/services/shared/product";
import { isValidObjectId } from "mongoose";

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

    const limit = Math.min(
        query.limit ? Number(query.limit) : 21,
        99
    );

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

    // images = the ones the admin kept + the new uploads
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
