const mongoose = require("mongoose");
const Category = require("../models/category");
const AppError = require("./AppError");

const Offer = require("../models/offerSeller");
const Listing = require("../models/listing");
const logger = require("../utils/logger");
const { round2, variantFinalPrice } = require("./pricing");
const { dateRangeFilter } = require("./listQuery");

const isValidId = mongoose.Types.ObjectId.isValid;

/* ═══════════════════════════ PAGINATION ═══════════════════════════ */

const paginate = async (
    Model,
    {
        limit,
        cursor = null,
        filters = {},
        sort = { createdAt: -1 },
        populate = null,
        select = null,
    } = {}
) => {
    limit = Math.min(Math.max(Number(limit) || 21, 1), 99);

    const sortKey = Object.keys(sort)[0] || "_id";
    const sortOrder = sort[sortKey];

    const query = { ...filters };

    if (cursor) {
        // added next to the filters (not over them): a date range on the same field
        // (createdAt) must still apply on page 2, 3, ...
        const cursorCondition = { [sortKey]: sortOrder === 1 ? { $gt: cursor } : { $lt: cursor } };
        query.$and = [...(query.$and || []), cursorCondition];
    }

    let dbQuery = Model.find(query).sort(sort).limit(limit).lean();

    if (populate) dbQuery = dbQuery.populate(populate);
    if (select) dbQuery = dbQuery.select(select);

    const data = await dbQuery;
    const nextCursor = data.length === limit ? data[data.length - 1][sortKey] : null;

    return {
        data,
        pagination: {
            limit,
            nextCursor,
            hasMore: data.length === limit,
        },
    };
};

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

/* ═══════════════════════════ LISTING FILTERS ═══════════════════════════ */

async function buildListingFilters(query, { isAdmin = false } = {}) {
    const filters = {};
    if (isAdmin) {
        // admin: one status, or "all" / nothing = every status except deleted
        filters.status = query.status && query.status !== "all" ? query.status : { $ne: "deleted" };
    } else if (query.status) {
        filters.status = query.status;
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

    // 5. Price Range Filter — on Listing.minPrice (user_ad = price, store_product = cheapest variant/offer)
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
    const offerId = item.offer || item.offerId || "";
    return `${String(offerId)}::${String(item.productId || "")}::${String(item.variantId || "")}`;
};

const findVariant = (listing, variantId) => {
    if (!variantId || !listing?.variants?.length) return null;
    return typeof listing.variants.id === "function"
        ? listing.variants.id(variantId)
        : listing.variants.find((v) => String(v._id) === String(variantId)) || null;
};

const getVariantSnapshot = (listing, variantId) => {
    const variant = findVariant(listing, variantId);
    if (!variant) return null;
    const attributes = variant.attributes instanceof Map
        ? Object.fromEntries(variant.attributes)
        : variant.attributes || null;
    return { attributes, sku: variant.sku };
};

const productInfoOf = (listing) => ({
    _id: listing._id,
    title: listing.title,
    slug: listing.slug,
    images: listing.images || [],
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

    const offerItems = items.filter((item) => item.offer);
    const directItems = items.filter((item) => !item.offer);

    /*  SELLER OFFERS */
    const offerIds = [...new Set(offerItems.map((i) => String(i.offer)))].filter(isValidId);

    const offers = offerIds.length
        ? await Offer.find({ _id: { $in: offerIds } })
            .populate("productId", "_id title slug images variants listingType status")
            .populate("store", "_id name")
        : [];

    offerItems.forEach((item) => {
        const found = offers.find((o) => String(o._id) === String(item.offer));
        if (!found) {
            skippedItems.push({ offerId: item.offer, reason: "offer_not_found" });
        }
    });

    offers.forEach((offer) => {
        const offerId = offer._id;
        const item = offerItems.find((i) => String(i.offer) === String(offer._id));

        if (offer.status !== "accepted") {
            skippedItems.push({ offerId, reason: "offer_not_accepted", status: offer.status });
            return;
        }
        if (!offer.productId) {
            skippedItems.push({ offerId, reason: "offer_missing_product_ref" });
            return;
        }
        if (offer.productId.status !== "active") {
            skippedItems.push({ offerId, reason: "product_not_available", status: offer.productId.status });
            return;
        }
        if (!(offer.stock > 0)) {
            skippedItems.push({ offerId, reason: "offer_out_of_stock", stock: offer.stock });
            return;
        }
        if (offer.stock < item.quantity) {
            skippedItems.push({ offerId, reason: "insufficient_stock", stock: offer.stock, requested: item.quantity });
            return;
        }

        const offerVariantId = offer.variantId ? String(offer.variantId) : null;
        if (!offerVariantId) {
            skippedItems.push({ offerId, reason: "offer_missing_variant" });
            return;
        }
        if (item.variantId && String(item.variantId) !== offerVariantId) {
            skippedItems.push({ offerId, reason: "variant_mismatch" });
            return;
        }
        const variantSnapshot = getVariantSnapshot(offer.productId, offerVariantId);
        if (!variantSnapshot) {
            skippedItems.push({ offerId, reason: "variant_not_found" });
            return;
        }

        const finalPrice = offer.finalPrice;
        subtotal += finalPrice * item.quantity;

        const storeId = offer.store?._id || offer.store || null;

        normalizedItems.push({
            productId: offer.productId._id,
            variantId: offerVariantId,
            offer: offer._id,
            store: storeId,
            quantity: item.quantity,
            price: offer.price,
            discount: offer.discount || 0,
            finalPrice,
            variantSnapshot,
            listingType: offer.productId.listingType || "store_product",
            shipsWithinDays: offer.shipsWithinDays ?? 3,
            productInfo: productInfoOf(offer.productId),
            offerInfo: {
                _id: offer._id,
                price: offer.price,
                discount: offer.discount || 0,
                finalPrice,
                stock: offer.stock,
                shipsWithinDays: offer.shipsWithinDays,
                store: storeId ? { _id: storeId, name: offer.store?.name } : null,
            },
        });
    });

    /* ── 2) BOUGHT FROM THE SITE (variant price) ── */
    const productIds = [...new Set(directItems.map((i) => String(i.productId || "")))].filter(isValidId);
    const listings = productIds.length ? await Listing.find({ _id: { $in: productIds } }) : [];

    directItems.forEach((item) => {
        if (!item.productId) {
            skippedItems.push({ reason: "missing_product_id" });
            return;
        }
        const found = listings.find((l) => String(l._id) === String(item.productId));
        if (!found) {
            skippedItems.push({ productId: item.productId, reason: "product_not_found" });
        }
    });

    listings.forEach((listing) => {
        const itemsOfListing = directItems.filter(
            (i) => String(i.productId) === String(listing._id)
        );

        if (!["active", "accepted"].includes(listing.status)) {
            itemsOfListing.forEach((item) => {
                skippedItems.push({ productId: item.productId, reason: "product_not_available", status: listing.status });
            });
            return;
        }

        itemsOfListing.forEach((item) => {
            let price = listing.listingType === "user_ad" ? listing.price : null;
            let discount = 0;
            let finalPrice = price;

            if (listing.listingType === "store_product") {
                if (!item.variantId) {
                    skippedItems.push({ productId: item.productId, reason: "missing_variant_id" });
                    return;
                }
                const variant = findVariant(listing, item.variantId);
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

                price = variant.price;
                discount = variant.discount || 0;
                finalPrice = variantFinalPrice(variant);
            }

            if (typeof finalPrice !== "number" || typeof price !== "number") {
                skippedItems.push({ productId: item.productId, reason: "price_not_available" });
                return;
            }

            subtotal += finalPrice * item.quantity;

            normalizedItems.push({
                productId: listing._id,
                variantId: item.variantId || null,
                offer: null,
                store: null,
                quantity: item.quantity,
                price,
                discount,
                finalPrice,
                variantSnapshot: getVariantSnapshot(listing, item.variantId),
                listingType: listing.listingType,
                shipsWithinDays: 3,
                productInfo: productInfoOf(listing),
                offerInfo: null,
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
            offer: newItem.offer || newItem.offerId || null,
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
    buildListingFilters,
    escapeRegex,
    normalizeSearchText,
    mergeCartItems,
    calculateCartTotals,
    itemKey,
    getCouponProblem,
};