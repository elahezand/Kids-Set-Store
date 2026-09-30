/** Admin form values (validated with productFormSchema) -> body for the product API / model. */
export const buildProductPayload = (values, images) => {
    const sizes = values.sizes?.length ? values.sizes : ["One size"];
    const base = String(values.title || "item")
        .toUpperCase()
        .replace(/[^A-Z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 24);

    return {
        title: values.title,
        description: values.description,
        categoryPath: values.categoryPath || [],
        tags: values.tags || [],
        specs: values.material ? { material: values.material } : {},
        status: values.status,
        ...(images ? { images } : {}),
        variants: sizes.map((size) => ({
            attributes: { size, ...(values.color ? { color: values.color } : {}) },
            sku: `${base}-${String(size).toUpperCase().replace(/\s+/g, "")}`,
            price: values.price,
            discount: values.discount || 0,
            stock: values.stock || 0,
        })),
    };
};

/** Product document -> initial values for the edit form. */
export const productToFormValues = (product) => {
    const variants = product?.variants || [];
    const first = variants[0] || {};
    const attr = (v, k) => (v?.attributes instanceof Map ? v.attributes.get(k) : v?.attributes?.[k]);
    const sizes = [...new Set(variants.map((v) => attr(v, "size")).filter((s) => s && s !== "One size"))];

    return {
        title: product?.title || "",
        description: product?.description || "",
        price: first.price ?? 0,
        discount: first.discount ?? 0,
        stock: variants.reduce((sum, v) => sum + (v.stock || 0), 0),
        sizes: sizes.join(", "),
        color: attr(first, "color") || "",
        material: product?.specs?.material || "",
        tags: (product?.tags || []).join(", "),
        categoryPath: (product?.categoryPath || []).map((c) => String(c?._id || c)),
        status: ["draft", "active", "inactive"].includes(product?.status) ? product.status : "draft",
    };
};
