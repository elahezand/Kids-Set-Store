import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import orderService from "@/services/server/admin/order";

import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";

import { adminOrdersQuerySchema } from "@/validators/order";

export async function GET(request) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = validate(adminOrdersQuerySchema, query);

    if (!result.success) {
      return validationError(result.errors);
    }

    const data = await orderService.getAllOrders(result.data);

    return respond({
      data: data.data,
      pagination: data.pagination,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
