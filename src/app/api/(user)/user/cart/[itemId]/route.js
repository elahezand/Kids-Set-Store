import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import cartService from "@/services/user/cart";
import { authUser } from "@/utils/auth/authGuard";
import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { itemId } = await params;

        const result = await cartService.removeFromCart(
            user._id,
            itemId
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}