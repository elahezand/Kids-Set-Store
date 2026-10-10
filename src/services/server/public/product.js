import { isValidObjectId } from "mongoose";
import Product from "@/model/product";
import { paginate, buildProductFilters } from "@/utils/helper";
import logger from "@/utils/logger";
import { findProductForDetail } from "@/services/server/shared/product";

const LIST_FIELDS =
  "title slug images minPrice price variants metrics status categoryPath tags shortIdentifier createdAt";

const SORTS = {
  latest: { _id: -1 },
  price: { minPrice: 1 },
  "price-desc": { minPrice: -1 },
  popularity: { "metrics.score": -1 },
  bestSelling: { "metrics.sold": -1 },
};

const clampLimit = (value, fallback = 12, max = 50) => Math.min(Math.max(Number(value) || fallback, 1), max);

const resolveSort = (query = {}) => SORTS[query.sort] || SORTS.latest;

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

const getLatestProducts = async (limit = 10) => {
  const { data } = await getAllProducts({ limit, sort: "latest" });
  return data;
};

const getBestSellingProducts = async (limit = 10) => {
  const { data } = await getAllProducts({ limit, sort: "bestSelling" });
  return data;
};

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
    Product.updateOne({ _id: id }, { $inc: { "metrics.views": 1 } }).catch((err) =>
      logger.error("[product] could not count view:", err)
    );
  }

  return {
    success: true,
    data: productData,
  };
};

const productService = {
  getAllProducts,
  getLatestProducts,
  getBestSellingProducts,
  getRelatedProducts,
  getProductById,
};

export default productService;
