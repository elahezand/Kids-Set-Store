import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const productIds = searchParams.getAll("productId").length
            ? searchParams.getAll("productId")
            : searchParams.get("productIds");

        const result = await favoriteService.checkFavorites(
            user._id,
            productIds
        );

        return respond(result);
    } catch (error) {
        return handleRouteError(error);
    }
}