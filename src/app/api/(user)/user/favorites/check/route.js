import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import favoriteService from "@/services/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

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

        return NextResponse.json(result);
    } catch (error) {
        return handleRouteError(error);
    }
}