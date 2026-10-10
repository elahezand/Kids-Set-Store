import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";
import validateObjectId from "@/utils/validateObjectId";

export async function DELETE(request, { params }) {
  try {
    await connectToDB();

    const user = await authUser();

    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const { productId } = await params;

    if (!validateObjectId(productId)) {
      return jsonError("Invalid product id", 400);
    }

    const result = await favoriteService.removeFavorite(user._id, productId);

    if (!result.success) {
      return jsonError(result.message, result.status);
    }

    return respond(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
