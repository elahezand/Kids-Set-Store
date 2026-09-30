import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import favoriteService from "@/services/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

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

        return NextResponse.json(result);
    } catch (error) {
        return handleRouteError(error);
    }
}