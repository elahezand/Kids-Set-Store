import Category from "@/model/category";

/* Tree builder */
const buildTree = (items, parentId = null) => {
    return items
        .filter(
            (category) =>
                String(category.parentId || null) ===
                String(parentId)
        )
        .map((category) => ({
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
            children: buildTree(items, category._id),
        }));
};

const getAllCategories = async () => {
    const categories = await Category.find({}).lean();

    return buildTree(categories);
};

const withInheritedFilters = async (category) => {
    if (!category) return null;

    let allFilters = [...(category.filters || [])];
    let currentParentId = category.parentId;

    while (currentParentId) {
        const parentCategory = await Category.findById(
            currentParentId
        )
            .select("filters parentId")
            .lean();

        if (parentCategory) {
            if (
                parentCategory.filters &&
                parentCategory.filters.length > 0
            ) {
                allFilters = [
                    ...parentCategory.filters,
                    ...allFilters,
                ];
            }

            currentParentId = parentCategory.parentId;
        } else {
            break;
        }
    }

    const uniqueFilters = Array.from(
        new Map(
            allFilters.map((filter) => [filter.slug, filter])
        ).values()
    );

    return {
        ...category,
        filters: uniqueFilters,
    };
};

const getCategoryById = async (id) => {
    const category = await Category.findById(id).lean();

    if (!category) return null;

    return withInheritedFilters(category);
};

const getCategoryBySlug = async (slug) => {
    const category = await Category.findOne({ slug }).lean();

    if (!category) return null;

    return withInheritedFilters(category);
};

export {
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
};