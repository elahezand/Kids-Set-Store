import connectToDB from "@/configs/db";
import cartService from "@/services/server/user/cart";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function DELETE(request, { params }) {
  try {
    await connectToDB();

    const user = await authUser();

    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const { itemId } = await params;

    const result = await cartService.removeFromCart(user._id, itemId);

    if (!result.success) {
      return jsonError(result.message, result.status);
    }

    return respond({
      success: true,
      data: result.data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
