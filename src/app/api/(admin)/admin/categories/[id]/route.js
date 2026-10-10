import connectToDB from "@/configs/db";
import { updateCategorySchema } from "@/validators/category";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import validateObjectId from "@/utils/validateObjectId";
import categoryService from "@/services/server/admin/category";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Admin access required", 401);
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
      return jsonError("Category not found", 404);
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const result = validate(updateCategorySchema, body);

    if (!result.success) {
      return validationError(result.errors);
    }

    const serviceResult = await categoryService.updateCategory(id, result.data);

    if (!serviceResult.success) {
      return jsonError(serviceResult.message, serviceResult.status);
    }

    return respond(
      {
        message: "Category updated successfully",
        data: serviceResult.data,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "PUT /api/admin/categories/:id");
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Admin access required", 401);
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
      return jsonError("Category not found", 404);
    }

    const serviceResult = await categoryService.deleteCategory(id);

    if (!serviceResult.success) {
      return jsonError(serviceResult.message, serviceResult.status);
    }

    return respond({ message: "Category deleted successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/categories/:id");
  }
}
