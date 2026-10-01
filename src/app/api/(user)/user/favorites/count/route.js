import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const result = await favoriteService.getFavoriteCount(
            user._id
        );

        return respond(result);
    } catch (error) {
        return handleRouteError(error);
    }
}