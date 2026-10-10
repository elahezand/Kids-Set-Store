import Category from "@/model/category";
import { remember, CACHE_KEYS } from "@/utils/cache";

const titleOf = (c) => c.title ?? c.name ?? "";

const toNode = (category, children = []) => ({
  id: String(category._id),
  title: titleOf(category),
  name: titleOf(category),
  slug: category.slug,
  description: category.description || "",
  icon: category.icon?.svgCode || null,
  children,
});

const buildTree = (items) => {
  const ids = new Set(items.map((item) => String(item._id)));
  const byParent = new Map();

  for (const item of items) {
    const parentId = item.parentId ? String(item.parentId) : null;
    const key = parentId && ids.has(parentId) ? parentId : "root";

    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(item);
  }

  const visited = new Set();
  const build = (key) =>
    (byParent.get(key) || [])
      .filter((item) => !visited.has(String(item._id)))
      .map((item) => {
        visited.add(String(item._id));
        return toNode(item, build(String(item._id)));
      });

  return build("root");
};

const getAllCategories = async () => remember(CACHE_KEYS.categories, 600, loadCategoryTree);

const loadCategoryTree = async () => {
  const categories = await Category.find({ isActive: { $ne: false } }).lean();

  categories.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));

  return buildTree(categories);
};

const withInheritedFilters = async (category) => {
  if (!category) return null;

  let allFilters = [...(category.filters || [])];
  let currentParentId = category.parentId;
  const visited = new Set([String(category._id)]);

  while (currentParentId && !visited.has(String(currentParentId))) {
    visited.add(String(currentParentId));

    const parentCategory = await Category.findById(currentParentId).select("filters parentId").lean();

    if (!parentCategory) break;

    if (parentCategory.filters?.length) {
      allFilters = [...parentCategory.filters, ...allFilters];
    }

    currentParentId = parentCategory.parentId;
  }

  const uniqueFilters = Array.from(new Map(allFilters.map((filter) => [filter.slug, filter])).values());

  return {
    ...category,
    name: category.title,
    filters: uniqueFilters,
  };
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id).lean();

  if (!category) return null;

  return withInheritedFilters(category);
};

const getCategoryBySlug = async (slug) => {
  if (!slug) return null;

  const category = await Category.findOne({
    slug: String(slug).trim().toLowerCase(),
  }).lean();

  if (!category) return null;

  return withInheritedFilters(category);
};

const categoryService = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
};

export default categoryService;
