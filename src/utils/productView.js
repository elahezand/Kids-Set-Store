const toId = (v) => (v?._id ? String(v._id) : null);

const serializeVariant = (variant) => ({
    ...variant,
    _id: toId(variant),
    attributes: variant.attributes ? { ...variant.attributes } : {},
});

export const toProductView = (product) => {
    if (!product) return null;

    const variants = (product.variants ?? []).map(serializeVariant);
    const images = product.images ?? [];
    const description = product.description ?? "";

    const defaultVariant =
        variants.find((v) => v.stock > 0) ?? variants[0] ?? null;

    const price =
        product.minPrice ??
        defaultVariant?.finalPrice ??
        defaultVariant?.price ??
        product.price ??
        0;

    return {
        _id: String(product._id),
        name: product.title,
        img: images[0] ?? "/placeholder.png",
        images,
        price,
        score: Math.round(product.metrics?.score ?? 0),
        shortDescription: description.slice(0, 160),
        longDescription: description,
        tags: product.tags ?? [],
        specs: product.specs ?? {},
        variants,
        defaultVariantId: defaultVariant?._id ?? null,
    };
};

export const toProductCard = (product) => {
    const { _id, name, img, price, score } = toProductView(product);
    return { _id, name, img, price, score };
};