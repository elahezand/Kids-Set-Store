import { NextResponse } from "next/server";
import connectToDB from "../../../../../../configs/db";
import { updateCategorySchema } from "../../../../../../validators/category";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import validateObjectId from "@/utils/api/validateObjectId";
import categoryService from "@/services/api/admin/categoryService";
import {
  validationError,
  jsonError,
  handleRouteError,
} from "@/utils/apiHelpers";

export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin) {
      return jsonError(
        "Admin access required",
        401
      );
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
      return jsonError(
        "Category not found",
        404
      );
    }

    const body = await req.json().catch(
      () => null
    );

    if (!body) {
      return jsonError(
        "Invalid JSON body",
        400
      );
    }

    const result = validate(
      updateCategorySchema,
      body
    );

    if (!result.success) {
      return validationError(
        result.errors
      );
    }

    const serviceResult =
      await categoryService.updateCategory(
        id,
        result.data
      );

    if (!serviceResult.success) {
      return jsonError(
        serviceResult.message,
        serviceResult.status
      );
    }

    return NextResponse.json(
      {
        message:
          "Category updated successfully",
        data: serviceResult.data,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(
      err,
      "PUT /api/admin/categories/:id"
    );
  }
}