import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import favoriteService from "@/services/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = await favoriteService.toggleFavorite(
            user._id,
            body.productId
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json(result);
    } catch (error) {
        return handleRouteError(error);
    }
}