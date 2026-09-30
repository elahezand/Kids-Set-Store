const mongoose = require("mongoose");
const Category = require("@/model/category");
const AppError = require("@/utils/AppError");

const Product = require("@/model/product");
const logger = require("@/utils/logger");
const { round2, variantFinalPrice } = require("@/utils/pricing");
const { dateRangeFilter } = require("@/utils/listQuery");
const { paginate } = require("@/utils/paginate");

const isValidId = mongoose.Types.ObjectId.isValid;

function escapeRegex(text) {
    return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/* Persian / Arabic text normalization for search:
   ۰-۹ and ٠-٩ → 0-9, Arabic ي/ك → Persian ی/ک, remove diacritics. */
function normalizeSearchText(str) {
    return String(str)
        .toLowerCase()
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/ي/g, "ی")
        .replace(/ك/g, "ک")
        .replace(/[\u064B-\u065F]/g, "")
        .trim();
}

/* ═══════════════════════════ PRODUCT FILTERS ═══════════════════════════ */

async function buildProductFilters(query, { isAdmin = false } = {}) {
    const filters = {};
    if (isAdmin) {
        // admin: one status, or "all" / nothing = every status except deleted
        filters.status = query.status && query.status !== "all" ? query.status : { $ne: "deleted" };
    } else if (query.status) {
        filters.status = "active";
    }


    // 2. Photos Filter
    if (query.hasPhoto === "true") {
        filters["images.0"] = { $exists: true };
    }

    // 3. SKU Filter
    if (query.sku) {
        filters["variants.sku"] = String(query.sku);
    }

    // 4. Category Filter
    if (query.category) {
        const categoryDoc = await Category.findOne({ slug: query.category }).select("_id").lean();
        filters.categoryPath = categoryDoc ? categoryDoc._id : null;
    } else if (query.categoryId && isValidId(query.categoryId)) {
        filters.categoryPath = new mongoose.Types.ObjectId(query.categoryId);
    }

    // 5. Price Range Filter — on Product.minPrice (cheapest variant)
    if (query.price) {
        const priceStr = String(query.price);
        if (priceStr.includes("-")) {
            const [minStr, maxStr] = priceStr.split("-");
            const min = minStr === "" ? undefined : Number(minStr);
            const max = maxStr === "" ? undefined : Number(maxStr);

            const priceFilter = {};
            if (min !== undefined && !isNaN(min)) priceFilter.$gte = min;
            if (max !== undefined && !isNaN(max)) priceFilter.$lte = max;
            if (Object.keys(priceFilter).length > 0) filters.minPrice = priceFilter;
        } else {
            const p = Number(priceStr);
            if (!isNaN(p)) filters.minPrice = p;
        }
    }

    // 6. Tags
    if (query.tags) {
        const tagsArray = String(query.tags).split(",").map((t) => t.trim()).filter(Boolean);
        if (tagsArray.length > 0) filters.tags = { $in: tagsArray };
    }

    // 8. Rating
    if (query.rating) {
        const minRating = Number(query.rating);
        if (!isNaN(minRating)) filters["metrics.score"] = { $gte: minRating };
    }


    // 10. Variant attributes (color, size)
    for (const key of ["color", "size"]) {
        if (query[key]) filters[`variants.attributes.${key}`] = String(query[key]);
    }

    // 11. Specs (JSON)
    if (query.filter) {
        let parsedFilter;
        try {
            parsedFilter = JSON.parse(query.filter);
        } catch {
            throw new AppError(400, "Invalid 'filter' query parameter: must be valid JSON");
        }
        for (const [key, value] of Object.entries(parsedFilter || {})) {
            if (!/^[\w\u0600-\u06FF -]+$/.test(key)) continue;
            filters[`specs.${key}`] = String(value);
        }
    }

    // 12. Text search (q)
    if (query.q) {
        const cleanQuery = normalizeSearchText(query.q).slice(0, 100);
        if (cleanQuery) {
            const compactQuery = cleanQuery.replace(/\s+/g, "");
            const tokens = cleanQuery.split(/\s+/).filter(Boolean);

            const searchConditions = [
                { title: { $regex: new RegExp(escapeRegex(cleanQuery), "i") } },
            ];
            if (compactQuery !== cleanQuery) {
                searchConditions.push({ title: { $regex: new RegExp(escapeRegex(compactQuery), "i") } });
            }
            if (tokens.length > 1) {
                searchConditions.push({
                    $and: tokens.map((token) => ({ title: { $regex: new RegExp(escapeRegex(token), "i") } })),
                });
            }
            andConditions.push({ $or: searchConditions });
        }
    }

    // 13. Created-at range, shared by every dashboard table (?from / ?to / ?preset)
    Object.assign(filters, dateRangeFilter(query, "createdAt"));

    if (andConditions.length > 0) filters.$and = andConditions;

    return filters;
}

/* ═══════════════════════════ CART ═══════════════════════════ */
const itemKey = (item) => {
    return `${String(item.productId || "")}::${String(item.variantId || "")}`;
};

const findVariant = (product, variantId) => {
    if (!variantId || !product?.variants?.length) return null;
    return typeof product.variants.id === "function"
        ? product.variants.id(variantId)
        : product.variants.find((v) => String(v._id) === String(variantId)) || null;
};

const getVariantSnapshot = (product, variantId) => {
    const variant = findVariant(product, variantId);
    if (!variant) return null;
    const attributes = variant.attributes instanceof Map
        ? Object.fromEntries(variant.attributes)
        : variant.attributes || null;
    return { attributes, sku: variant.sku };
};

const productInfoOf = (product) => ({
    _id: product._id,
    title: product.title,
    slug: product.slug,
    images: product.images || [],
});

const getCouponProblem = (couponDoc) => {
    if (!couponDoc) return "Coupon not found";
    const now = new Date();
    if (!couponDoc.isActive) return "Coupon is inactive";
    if (couponDoc.startsAt && couponDoc.startsAt > now) return "Coupon has not started yet";
    if (couponDoc.expiresAt && couponDoc.expiresAt < now) return "Coupon has expired";
    if (couponDoc.usageLimit != null && couponDoc.usedCount >= couponDoc.usageLimit) {
        return "Coupon usage limit reached";
    }
    return null;
};

const calcCouponDiscount = (couponDoc, subtotal) => {
    if (!couponDoc || getCouponProblem(couponDoc)) return 0;
    let discount = 0;
    if (couponDoc.type === "percent") {
        discount = (subtotal * Number(couponDoc.amount || 0)) / 100;
    } else if (couponDoc.type === "fixed") {
        discount = Number(couponDoc.amount || 0);
    }
    if (couponDoc.maxDiscount) discount = Math.min(discount, Number(couponDoc.maxDiscount));
    return round2(Math.min(discount, subtotal));
};

const calculateCartTotals = async (rawItems, couponDoc = null, shippingCost = 0) => {
    const normalizedItems = [];
    const skippedItems = [];
    let subtotal = 0;


    const items = mergeCartItems([], rawItems || []);

    const directItems = items;

    /* Price every item from its variant */
    const productIds = [...new Set(directItems.map((i) => String(i.productId || "")))].filter(isValidId);
    const products = productIds.length ? await Product.find({ _id: { $in: productIds } }) : [];

    directItems.forEach((item) => {
        if (!item.productId) {
            skippedItems.push({ reason: "missing_product_id" });
            return;
        }
        const found = products.find((l) => String(l._id) === String(item.productId));
        if (!found) {
            skippedItems.push({ productId: item.productId, reason: "product_not_found" });
        }
    });

    products.forEach((product) => {
        const itemsOfProduct = directItems.filter(
            (i) => String(i.productId) === String(product._id)
        );

        if (!["active", "accepted"].includes(product.status)) {
            itemsOfProduct.forEach((item) => {
                skippedItems.push({ productId: item.productId, reason: "product_not_available", status: product.status });
            });
            return;
        }

        itemsOfProduct.forEach((item) => {
            if (!item.variantId) {
                skippedItems.push({ productId: item.productId, reason: "missing_variant_id" });
                return;
            }
            const variant = findVariant(product, item.variantId);
            if (!variant) {
                skippedItems.push({ productId: item.productId, reason: "variant_not_found" });
                return;
            }
            if (!(variant.stock > 0)) {
                skippedItems.push({ productId: item.productId, reason: "variant_out_of_stock", stock: variant.stock });
                return;
            }
            if (variant.stock < item.quantity) {
                skippedItems.push({ productId: item.productId, reason: "insufficient_stock", stock: variant.stock, requested: item.quantity });
                return;
            }

            const price = variant.price;
            const discount = variant.discount || 0;
            const finalPrice = variantFinalPrice(variant);

            if (typeof finalPrice !== "number" || typeof price !== "number") {
                skippedItems.push({ productId: item.productId, reason: "price_not_available" });
                return;
            }

            subtotal += finalPrice * item.quantity;

            normalizedItems.push({
                productId: product._id,
                variantId: item.variantId || null,
                quantity: item.quantity,
                price,
                discount,
                finalPrice,
                variantSnapshot: getVariantSnapshot(product, item.variantId),
                shipsWithinDays: 3,
                productInfo: productInfoOf(product),
            });
        });
    });

    if (skippedItems.length > 0) {
        logger.warn("[cart] skipped items while calculating totals:", skippedItems);
    }

    subtotal = round2(subtotal);
    const couponDiscount = calcCouponDiscount(couponDoc, subtotal);
    const shipping = round2(Number(shippingCost || 0));

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
const mergeCartItems = (currentItems, newItems) => {
    const merged = currentItems.map((item) => ({ ...item }));

    for (const newItem of newItems) {
        const normalized = {
            productId: newItem.productId,
            variantId: newItem.variantId || null,
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

module.exports = {
    paginate,
    buildProductFilters,
    escapeRegex,
    normalizeSearchText,
    mergeCartItems,
    calculateCartTotals,
    itemKey,
    getCouponProblem,
};