import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../../configs/db";
import CategoryModel from "../../../../../../model/category";
import ProductModel from "../../../../../../model/product";
import { updateCategorySchema } from "../../../../../../validators/category";
import { authAdmin } from "@/utils/serverHelper";
import slugify from "@/utils/slugify";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

const MAX_DEPTH = 10;

// Every handler here: admin + valid id
const guard = async (params) => {
  const admin = await authAdmin();
  if (!admin) return { error: jsonError("Admin access required", 401) };

  const { id } = await params;
  if (!isValidObjectId(id)) return { error: jsonError("Category not found", 404) };

  return { admin, id };
};

/** true if `targetId` is `categoryId` itself or one of its sub categories */
const isSelfOrDescendant = async (categoryId, targetId) => {
  let currentId = targetId;

  for (let depth = 0; currentId && depth < MAX_DEPTH; depth++) {
    if (String(currentId) === String(categoryId)) return true;

    const current = await CategoryModel.findById(currentId).select("parentId").lean();
    currentId = current?.parentId;
  }

  return false;
};

/* PUT /api/admin/categories/:id */
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const category = await CategoryModel.findById(id);
    if (!category) return jsonError("Category not found", 404);

    const data = parsed.data;

    const nextName = data.name ?? category.name;
    const nextParentId = data.parentId !== undefined ? data.parentId : category.parentId;
    const parentChanged = String(nextParentId ?? "") !== String(category.parentId ?? "");

    if (parentChanged && nextParentId) {
      if (!(await CategoryModel.exists({ _id: nextParentId }))) {
        return jsonError("Parent category not found", 404);
      }

      if (await isSelfOrDescendant(id, nextParentId)) {
        return jsonError("A category can't be moved under itself or its sub categories", 409);
      }
    }

    if (data.name !== undefined || parentChanged) {
      const nameTaken = await CategoryModel.exists({
        _id: { $ne: id },
        name: nextName,
        parentId: nextParentId ?? null,
      }).collation({ locale: "en", strength: 2 });

      if (nameTaken) {
        return jsonError("A category with this name already exists here", 409);
      }
    }

    if (data.slug !== undefined) {
      const nextSlug = slugify(data.slug);
      if (!nextSlug) return jsonError("Invalid slug", 400);

      if (await CategoryModel.exists({ _id: { $ne: id }, slug: nextSlug })) {
        return jsonError("A category with this slug already exists", 409);
      }

      category.slug = nextSlug;
    }

    category.name = nextName;
    category.parentId = nextParentId ?? null;
    await category.save();
    if (parentChanged) {
      const products = ProductModel.find({ categoryPath: category._id }).cursor();

      for await (const product of products) {
        product.categoryPath = [product.categoryPath.at(-1)];
        await product.save();
      }
    }

    return NextResponse.json(
      { message: "Category updated successfully", data: category },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "PUT /api/admin/categories/:id");
  }
}

/* DELETE /api/admin/categories/:id */
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const [childrenCount, productsCount] = await Promise.all([
      CategoryModel.countDocuments({ parentId: id }),
      ProductModel.countDocuments({ categoryPath: id }),
    ]);

    if (childrenCount > 0) {
      return jsonError(
        `This category has ${childrenCount} sub categories. Delete or move them first.`,
        409
      );
    }

    if (productsCount > 0) {
      return jsonError(
        `${productsCount} products use this category. Move them to another category first.`,
        409
      );
    }

    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) return jsonError("Category not found", 404);

    return NextResponse.json({ message: "Category removed successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/categories/:id");
  }
}