import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import favoriteService from "@/services/user/favorite";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";
import validateObjectId from "@/utils/validateObjectId";

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { productId } = await params;

        if (!validateObjectId(productId)) {
            return jsonError("Invalid product id", 400);
        }

        const result = await favoriteService.removeFavorite(
            user._id,
            productId
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json(result);
    } catch (error) {
        return handleRouteError(error);
    }
}