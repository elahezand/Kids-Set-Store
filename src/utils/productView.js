
export const toProductView = (product) => {
    if (!product) return null;

    const variants = product.variants || [];
    const images = product.images || [];

    const firstInStock =
        variants.find((v) => v.stock > 0) || variants[0];

    const price =
        product.minPrice ||
        firstInStock?.finalPrice ||
        firstInStock?.price ||
        product.price ||
        0;

    return {
        _id: String(product._id),
        name: product.title,
        img: images[0] || "/placeholder.png",
        images,
        price,
        score: Math.round(product.metrics?.score || 0),
        shortDescription: product.description
            ? product.description.slice(0, 160)
            : "",

        longDescription: product.description || "",
        tags: product.tags || [],
        specs: product.specs || {},
        variants,
        variantId: firstInStock?._id
            ? String(firstInStock._id)
            : null,
    };
};
