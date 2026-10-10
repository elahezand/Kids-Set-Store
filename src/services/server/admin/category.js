import invalidateCache, { CACHE_KEYS } from "@/utils/cache";
import Category from "@/model/category";
import Product from "@/model/product";
import slugify from "@/utils/slugify";

const MAX_DEPTH = 10;

const isSelfOrDescendant = async (categoryId, targetId) => {
  let currentId = targetId;

  for (let depth = 0; currentId && depth < MAX_DEPTH; depth++) {
    if (String(currentId) === String(categoryId)) {
      return true;
    }

    const current = await Category.findById(currentId).select("parentId").lean();

    currentId = current?.parentId;
  }

  return false;
};

const createCategory = async (data) => {
  const { name, parentId, description } = data;

  const slug = slugify(data.slug || name);

  if (!slug) {
    return {
      success: false,
      status: 400,
      message: "Could not create a valid slug from this name",
    };
  }

  if (
    parentId &&
    !(await Category.exists({
      _id: parentId,
    }))
  ) {
    return {
      success: false,
      status: 404,
      message: "Parent category not found",
    };
  }

  const nameTaken = await Category.exists({
    title: name,
    parentId: parentId ?? null,
  }).collation({
    locale: "en",
    strength: 2,
  });

  if (nameTaken) {
    return {
      success: false,
      status: 409,
      message: "A category with this name already exists here",
    };
  }

  if (
    await Category.exists({
      slug,
    })
  ) {
    return {
      success: false,
      status: 409,
      message: "A category with this slug already exists",
    };
  }

  const category = await Category.create({
    title: name,
    slug,
    parentId: parentId ?? null,
    description: description ?? "",
  });

  return {
    success: true,
    data: category,
  };
};

const updateCategory = async (id, data) => {
  const category = await Category.findById(id);

  if (!category) {
    return {
      success: false,
      status: 404,
      message: "Category not found",
    };
  }

  const nextName = data.name ?? category.title;

  const nextParentId = data.parentId !== undefined ? data.parentId : category.parentId;

  const parentChanged = String(nextParentId ?? "") !== String(category.parentId ?? "");

  if (parentChanged && nextParentId) {
    if (
      !(await Category.exists({
        _id: nextParentId,
      }))
    ) {
      return {
        success: false,
        status: 404,
        message: "Parent category not found",
      };
    }

    if (await isSelfOrDescendant(id, nextParentId)) {
      return {
        success: false,
        status: 409,
        message: "A category can't be moved under itself or its sub categories",
      };
    }
  }

  if (data.name !== undefined || parentChanged) {
    const nameTaken = await Category.exists({
      _id: { $ne: id },
      title: nextName,
      parentId: nextParentId ?? null,
    }).collation({
      locale: "en",
      strength: 2,
    });

    if (nameTaken) {
      return {
        success: false,
        status: 409,
        message: "A category with this name already exists here",
      };
    }
  }

  if (data.slug !== undefined) {
    const nextSlug = slugify(data.slug);

    if (!nextSlug) {
      return {
        success: false,
        status: 400,
        message: "Invalid slug",
      };
    }

    if (
      await Category.exists({
        _id: { $ne: id },
        slug: nextSlug,
      })
    ) {
      return {
        success: false,
        status: 409,
        message: "A category with this slug already exists",
      };
    }

    category.slug = nextSlug;
  }

  category.title = nextName;

  if (data.description !== undefined) {
    category.description = data.description ?? "";
  }
  category.parentId = nextParentId ?? null;

  await category.save();

  if (parentChanged) {
    const products = Product.find({
      categoryPath: category._id,
    }).cursor();

    for await (const product of products) {
      product.categoryPath = [product.categoryPath.at(-1)];

      await product.save();
    }
  }

  return {
    success: true,
    data: category,
  };
};

const deleteCategory = async (id) => {
  const [childrenCount, productsCount] = await Promise.all([
    Category.countDocuments({
      parentId: id,
    }),
    Product.countDocuments({
      categoryPath: id,
    }),
  ]);

  if (childrenCount > 0) {
    return {
      success: false,
      status: 409,
      message: `This category has ${childrenCount} sub categories. Delete or move them first.`,
    };
  }

  if (productsCount > 0) {
    return {
      success: false,
      status: 409,
      message: `${productsCount} products use this category. Move them to another category first.`,
    };
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return {
      success: false,
      status: 404,
      message: "Category not found",
    };
  }

  return {
    success: true,
    data: category,
  };
};

const getAdminCategories = async () => {
  const [categories, productCounts] = await Promise.all([
    Category.find().select("title name slug description parentId isActive createdAt").lean(),
    Product.aggregate([{ $unwind: "$categoryPath" }, { $group: { _id: "$categoryPath", count: { $sum: 1 } } }]),
  ]);

  const products = new Map(productCounts.map((row) => [String(row._id), row.count]));
  const children = new Map();

  for (const category of categories) {
    if (!category.parentId) continue;
    const key = String(category.parentId);
    children.set(key, (children.get(key) || 0) + 1);
  }

  return categories
    .map((category) => ({
      _id: String(category._id),
      title: category.title ?? category.name ?? "",
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId ? String(category.parentId) : null,
      isActive: category.isActive !== false,
      productsCount: products.get(String(category._id)) || 0,
      childrenCount: children.get(String(category._id)) || 0,
      createdAt: category.createdAt,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

const clearsCache =
  (fn) =>
  async (...args) => {
    const result = await fn(...args);
    if (result?.success !== false) await invalidateCache(CACHE_KEYS.categories);
    return result;
  };

const createCategoryCached = clearsCache(createCategory);
const deleteCategoryCached = clearsCache(deleteCategory);
const updateCategoryCached = clearsCache(updateCategory);

export {
  getAdminCategories,
  createCategoryCached as createCategory,
  deleteCategoryCached as deleteCategory,
  updateCategoryCached as updateCategory,
};

export default {
  getAdminCategories,
  createCategory: createCategoryCached,
  deleteCategory: deleteCategoryCached,
  updateCategory: updateCategoryCached,
};
