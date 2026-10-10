import mongoose from "mongoose";
import Category from "@/model/category";
import AppError from "@/utils/AppError";
import Product from "@/model/product";
import logger from "@/utils/logger";
import { round2, shippingCostFor, formatMoney } from "@/utils/pricing";
import { dateRangeFilter } from "@/utils/listQuery";
import paginate from "@/utils/paginate";
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function escapeRegex(text) {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function normalizeSearchText(str) {
  return String(str ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-'']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const looseWordRegex = (word) => new RegExp(word.split("").map(escapeRegex).join("[^a-z0-9]*"), "i");

const exactAny = (raw) => {
  const regexes = String(raw)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((value) => new RegExp(`^${escapeRegex(value.slice(0, 50))}$`, "i"));

  if (!regexes.length) return null;
  return regexes.length === 1 ? regexes[0] : { $in: regexes };
};

const MAX_SEARCH_WORDS = 5;

async function buildProductFilters(query, { isAdmin = false } = {}) {
  const filters = {};
  const andConditions = [];

  if (isAdmin) {
    filters.status = query.status && query.status !== "all" ? query.status : { $ne: "deleted" };
  } else {
    filters.status = "active";
  }

  if (query.hasPhoto === "true") {
    filters["images.0"] = { $exists: true };
  }

  if (query.sku) {
    filters["variants.sku"] = String(query.sku).trim();
  }

  if (query.category) {
    const categoryDoc = await Category.findOne({
      slug: String(query.category).trim().toLowerCase(),
    })
      .select("_id")
      .lean();

    filters.categoryPath = categoryDoc ? categoryDoc._id : null;
  } else if (query.categoryId && isValidId(query.categoryId)) {
    filters.categoryPath = new mongoose.Types.ObjectId(query.categoryId);
  }

  const priceFilter = {};

  if (query.price) {
    const priceStr = String(query.price);
    if (priceStr.includes("-")) {
      const [minStr, maxStr] = priceStr.split("-");
      if (minStr !== "" && !isNaN(Number(minStr))) priceFilter.$gte = Number(minStr);
      if (maxStr !== "" && !isNaN(Number(maxStr))) priceFilter.$lte = Number(maxStr);
    } else if (!isNaN(Number(priceStr))) {
      filters.minPrice = Number(priceStr);
    }
  }
  if (query.min !== undefined && query.min !== "" && !isNaN(Number(query.min))) {
    priceFilter.$gte = Number(query.min);
  }
  if (query.max !== undefined && query.max !== "" && !isNaN(Number(query.max))) {
    priceFilter.$lte = Number(query.max);
  }
  if (Object.keys(priceFilter).length) filters.minPrice = priceFilter;

  if (query.tags) {
    const tagsArray = String(query.tags)
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tagsArray.length > 0) filters.tags = { $in: tagsArray };
  }

  if (query.rating) {
    const minRating = Number(query.rating);
    if (!isNaN(minRating)) filters["metrics.score"] = { $gte: minRating };
  }

  const variantMatch = {};
  for (const key of ["size", "color"]) {
    if (query[key]) {
      const match = exactAny(query[key]);
      if (match) variantMatch[`attributes.${key}`] = match;
    }
  }
  if (query.inStock === "true") variantMatch.stock = { $gt: 0 };
  if (query.onSale === "true") variantMatch.discount = { $gt: 0 };
  if (Object.keys(variantMatch).length) {
    filters.variants = { $elemMatch: variantMatch };
  }

  const specs = {};
  if (query.material) specs.material = query.material;

  if (query.filter) {
    let parsedFilter;
    try {
      parsedFilter = JSON.parse(query.filter);
    } catch {
      throw new AppError(400, "Invalid 'filter' query parameter: must be valid JSON");
    }
    if (parsedFilter && typeof parsedFilter === "object") Object.assign(specs, parsedFilter);
  }

  for (const [key, value] of Object.entries(specs)) {
    if (!/^[a-z0-9_-]{1,40}$/i.test(key)) continue;
    const match = exactAny(Array.isArray(value) ? value.join(",") : value);
    if (match) filters[`specs.${key}`] = match;
  }

  if (query.q) {
    const allWords = normalizeSearchText(query.q).slice(0, 100).split(" ").filter(Boolean);
    const longWords = allWords.filter((word) => word.length > 1);
    const words = (longWords.length ? longWords : allWords).slice(0, MAX_SEARCH_WORDS);

    for (const word of words) {
      const regex = looseWordRegex(word);
      andConditions.push({ $or: [{ title: regex }, { tags: regex }] });
    }
  }

  Object.assign(filters, dateRangeFilter(query, "createdAt"));

  if (andConditions.length > 0) filters.$and = andConditions;

  return filters;
}
const itemKey = (item) =>
  `${String(item.productId?._id || item.productId || "")}::${String(item.variantId?._id || item.variantId || "")}`;

const findVariant = (product, variantId) => {
  if (!variantId || !product?.variants?.length) return null;
  return typeof product.variants.id === "function"
    ? product.variants.id(variantId)
    : product.variants.find((v) => String(v._id) === String(variantId)) || null;
};

const getVariantSnapshot = (product, variantId) => {
  const variant = findVariant(product, variantId);
  if (!variant) return null;
  const attributes =
    variant.attributes instanceof Map ? Object.fromEntries(variant.attributes) : variant.attributes || null;
  return { attributes, sku: variant.sku };
};

const productInfoOf = (product) => ({
  _id: product._id,
  title: product.title,
  slug: product.slug,
  images: product.images || [],
});

const getSellable = (product, variantId) => {
  const hasVariants = product.variants?.length > 0;

  if (!hasVariants) {
    return {
      variantId: null,
      price: Number(product.price ?? product.minPrice),
      stock: product.stock == null ? Infinity : Number(product.stock),
      snapshot: null,
    };
  }

  if (!variantId) return { problem: { reason: "missing_variant_id" } };

  const variant = findVariant(product, variantId);
  if (!variant) return { problem: { reason: "variant_not_found" } };

  return {
    variantId,
    price: Number(variant.price),
    stock: variant.stock,
    snapshot: getVariantSnapshot(product, variantId),
  };
};

const getCouponProblem = (couponDoc, { subtotal = null } = {}) => {
  if (!couponDoc) return "Coupon not found";
  const now = new Date();
  if (!couponDoc.isActive) return "Coupon is inactive";
  if (couponDoc.startsAt && couponDoc.startsAt > now) return "Coupon has not started yet";
  if (couponDoc.expiresAt && couponDoc.expiresAt < now) return "Coupon has expired";
  if (couponDoc.usageLimit != null && couponDoc.usedCount >= couponDoc.usageLimit) {
    return "Coupon usage limit reached";
  }
  if (subtotal != null && couponDoc.minOrderAmount && subtotal < couponDoc.minOrderAmount) {
    return `This coupon needs an order of at least ${formatMoney(couponDoc.minOrderAmount)}`;
  }
  return null;
};

const calcCouponDiscount = (couponDoc, subtotal) => {
  if (!couponDoc || getCouponProblem(couponDoc, { subtotal })) return 0;
  let discount = 0;
  if (couponDoc.type === "percent") {
    discount = (subtotal * Number(couponDoc.amount || 0)) / 100;
  } else if (couponDoc.type === "fixed") {
    discount = Number(couponDoc.amount || 0);
  }
  if (couponDoc.maxDiscount) discount = Math.min(discount, Number(couponDoc.maxDiscount));
  return round2(Math.min(discount, subtotal));
};

const mergeCartItems = (currentItems, newItems) => {
  const merged = currentItems.map((item) => {
    const plainItem = item.toObject?.() ?? item;

    return {
      ...plainItem,
      productId: plainItem.productId?._id || plainItem.productId,
      variantId: plainItem.variantId?._id || plainItem.variantId || null,
    };
  });

  for (const rawItem of newItems || []) {
    const newItem = rawItem.toObject?.() ?? rawItem;

    const normalized = {
      productId: newItem.productId?._id || newItem.productId,

      variantId: newItem.variantId?._id || newItem.variantId || null,

      quantity: Math.max(Number(newItem.quantity) || 1, 1),
    };

    const existing = merged.find((item) => itemKey(item) === itemKey(normalized));

    if (existing) {
      existing.quantity = Number(existing.quantity) + normalized.quantity;
    } else {
      merged.push(normalized);
    }
  }

  return merged;
};

const resolveItemVariants = async (rawItems) => {
  const normalized = (rawItems || []).map((item) => {
    const plainItem = item.toObject?.() ?? item;

    return {
      ...plainItem,
      productId: plainItem.productId?._id || plainItem.productId,
      variantId: plainItem.variantId?._id || plainItem.variantId || null,
      quantity: Number(plainItem.quantity) || 1,
    };
  });

  const needIds = [
    ...new Set(
      normalized
        .filter((i) => !i.variantId && i.productId)
        .map((i) => String(i.productId))
        .filter(isValidId)
    ),
  ];

  if (!needIds.length) return normalized;

  const products = await Product.find({
    _id: { $in: needIds },
  }).select("variants._id");

  const singleVariant = new Map();

  for (const product of products) {
    if (product.variants?.length === 1) {
      singleVariant.set(String(product._id), product.variants[0]._id);
    }
  }

  return normalized.map((item) =>
    !item.variantId && singleVariant.has(String(item.productId))
      ? {
          ...item,
          variantId: singleVariant.get(String(item.productId)),
        }
      : item
  );
};

const calculateCartTotals = async (rawItems, couponDoc = null, shippingCost = null) => {
  const normalizedItems = [];
  const skippedItems = [];
  let subtotal = 0;

  const resolvedItems = await resolveItemVariants(rawItems);

  const items = mergeCartItems([], resolvedItems);

  const productIds = [...new Set(items.map((i) => String(i.productId || "")).filter((id) => id && isValidId(id)))];

  const products = productIds.length ? await Product.find({ _id: { $in: productIds } }) : [];

  const productMap = new Map(products.map((p) => [String(p._id), p]));

  for (const item of items) {
    if (!item.productId) {
      skippedItems.push({
        reason: "missing_product_id",
      });
      continue;
    }

    const product = productMap.get(String(item.productId));

    if (!product) {
      skippedItems.push({
        productId: item.productId,
        reason: "product_not_found",
      });
      continue;
    }

    if (!["active", "accepted"].includes(product.status)) {
      skippedItems.push({
        productId: item.productId,
        reason: "product_not_available",
        status: product.status,
      });
      continue;
    }

    const sellable = getSellable(product, item.variantId);

    if (sellable.problem) {
      skippedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        ...sellable.problem,
      });
      continue;
    }

    const { price, stock, snapshot } = sellable;

    const ref = {
      productId: item.productId,
      variantId: sellable.variantId,
    };

    if (!(stock > 0)) {
      skippedItems.push({
        ...ref,
        reason: "out_of_stock",
        stock,
      });
      continue;
    }

    if (stock < item.quantity) {
      skippedItems.push({
        ...ref,
        reason: "insufficient_stock",
        stock,
        requested: item.quantity,
      });
      continue;
    }

    if (!Number.isFinite(price)) {
      skippedItems.push({
        ...ref,
        reason: "price_not_available",
      });
      continue;
    }

    const discount = 0;
    const finalPrice = price;

    subtotal += finalPrice * item.quantity;

    normalizedItems.push({
      productId: product._id,
      variantId: sellable.variantId,
      quantity: item.quantity,
      price,
      discount,
      finalPrice,
      variantSnapshot: snapshot,
      shipsWithinDays: 3,
      productInfo: productInfoOf(product),
    });
  }

  if (skippedItems.length > 0) {
    logger.warn("[cart] skipped items while calculating totals:", skippedItems);
  }

  subtotal = round2(subtotal);

  const couponDiscount = calcCouponDiscount(couponDoc, subtotal);

  const shipping = round2(shippingCost ?? shippingCostFor(subtotal - couponDiscount));

  return {
    items: normalizedItems,
    skippedItems,
    pricing: {
      subtotal,
      discount: couponDiscount,
      shippingCost: shipping,
      total: round2(subtotal - couponDiscount + shipping),
    },
  };
};
export {
  paginate,
  buildProductFilters,
  escapeRegex,
  normalizeSearchText,
  mergeCartItems,
  calculateCartTotals,
  resolveItemVariants,
  itemKey,
  getCouponProblem,
};

export default {
  paginate,
  buildProductFilters,
  escapeRegex,
  normalizeSearchText,
  mergeCartItems,
  calculateCartTotals,
  resolveItemVariants,
  itemKey,
  getCouponProblem,
};
