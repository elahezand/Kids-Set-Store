import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request) {
  try {
    await connectToDB();

    const user = await authUser();

    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const result = await favoriteService.getUserFavorites(user._id, query);

    return respond({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
