import connectToDB from "@/configs/db";
import { createCategorySchema } from "@/validators/category";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import categoryService from "@/services/server/admin/category";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Admin access required", 401);
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const result = validate(createCategorySchema, body);

    if (!result.success) {
      return validationError(result.errors);
    }

    const serviceResult = await categoryService.createCategory(result.data);

    if (!serviceResult.success) {
      return jsonError(serviceResult.message, serviceResult.status);
    }

    return respond(
      {
        message: "Category created successfully",
        data: serviceResult.data,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/admin/categories");
  }
}
