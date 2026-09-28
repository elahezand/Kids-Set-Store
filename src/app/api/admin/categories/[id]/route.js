import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import CategoryModel from "../../../../../model/category";
import { createCategorySchema } from "../../../../../validators/category";
import { authAdmin } from "@/utils/serverHelper";
import slugify from "@/utils/slugify";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

/* POST /api/admin/categories */
export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, parentId } = parsed.data;
    const slug = slugify(parsed.data.slug || name);

    if (!slug) {
      return jsonError("Could not create a valid slug from this name", 400);
    }

    // Parent must exist
    if (parentId && !(await CategoryModel.exists({ _id: parentId }))) {
      return jsonError("Parent category not found", 404);
    }
    const nameTaken = await CategoryModel.exists({ name, parentId }).collation({
      locale: "en",
      strength: 2,
    });
    if (nameTaken) {
      return jsonError("A category with this name already exists here", 409);
    }

    if (await CategoryModel.exists({ slug })) {
      return jsonError("A category with this slug already exists", 409);
    }

    const category = await CategoryModel.create({ name, slug, parentId });

    return NextResponse.json(
      { message: "Category created successfully", data: category },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/admin/categories");
  }
}