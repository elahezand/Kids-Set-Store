import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import cartService from "@/services/server/admin/cart";

import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";

import { adminCartsQuerySchema } from "@/validators/cart";

export async function GET(request) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = validate(adminCartsQuerySchema, query);

    if (!result.success) {
      return validationError(result.errors);
    }

    const data = await cartService.getAdminCarts(result.data);

    return respond({
      data: data.data,
      pagination: data.pagination,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
