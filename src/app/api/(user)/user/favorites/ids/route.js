import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        return fromService(await favoriteService.getFavoriteIds(user._id));
    } catch (error) {
        return handleRouteError(error);
    }
}