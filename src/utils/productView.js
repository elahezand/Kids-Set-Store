/*
  model/product.js -> shape the UI uses.
  Product has no single price: every variant has price / discount / finalPrice / stock
  and Product.minPrice = cheapest variant finalPrice.
*/

export const PLACEHOLDER_IMAGE = "/placeholder.png";

const toId = (v) => (v?._id ? String(v._id) : v ? String(v) : null);

const toPlainAttributes = (attributes) => {
    if (!attributes) return {};
    if (attributes instanceof Map) return Object.fromEntries(attributes);
    return { ...attributes };
};

const serializeVariant = (variant) => ({
    _id: toId(variant),
    sku: variant.sku ?? null,
    attributes: toPlainAttributes(variant.attributes),
    price: Number(variant.price ?? 0),
    discount: Number(variant.discount ?? 0),
    finalPrice: Number(variant.finalPrice ?? variant.price ?? 0),
    stock: Number(variant.stock ?? 0),
});

export const toProductView = (product) => {
    if (!product) return null;

    const variants = (product.variants ?? []).map(serializeVariant);
    const images = (product.images ?? []).filter(Boolean);
    const description = product.description ?? "";

    const defaultVariant =
        variants.find((v) => v.stock > 0) ?? variants[0] ?? null;

    const price =
        product.minPrice ||
        defaultVariant?.finalPrice ||
        defaultVariant?.price ||
        product.price ||
        0;

    // "was" price of a discounted variant that sells at the shown price
    const originalPrice =
        variants.find((v) => v.finalPrice === price && v.price > v.finalPrice)
            ?.price ?? null;

    const inStock = variants.length
        ? variants.some((v) => v.stock > 0)
        : true;

    const categories = (product.categoryPath ?? [])
        .filter((c) => c && typeof c === "object" && c.title)
        .map((c) => ({ _id: toId(c), title: c.title, slug: c.slug }));

    return {
        _id: String(product._id),
        name: product.title,
        slug: product.slug ?? null,
        img: images[0] ?? PLACEHOLDER_IMAGE,
        images,
        price,
        originalPrice,
        score: Math.round(product.metrics?.score ?? 0),
        reviewsCount: product.metrics?.reviewsCount ?? 0,
        shortDescription: description.slice(0, 160),
        longDescription: description,
        tags: product.tags ?? [],
        specs: toPlainAttributes(product.specs),
        categories,
        variants,
        variantsCount: variants.length,
        defaultVariantId: defaultVariant?._id ?? null,
        inStock,
    };
};

/* What a product card needs (keeps the payload sent to the client small) */
export const toProductCard = (product) => {
    const view = toProductView(product);
    if (!view) return null;

    const {
        _id,
        name,
        img,
        price,
        originalPrice,
        score,
        variantsCount,
        defaultVariantId,
        inStock,
    } = view;

    return {
        _id,
        name,
        img,
        price,
        originalPrice,
        score,
        variantsCount,
        defaultVariantId,
        inStock,
    };
};

export const toProductCards = (products = []) =>
    products.map(toProductCard).filter(Boolean);
