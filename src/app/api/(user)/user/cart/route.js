import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import cartService from "@/services/user/cart";
import { authUser } from "@/utils/auth/authGuard";
import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const result = await cartService.getUserCart(
            user._id
        );

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = await cartService.addToCart(
            user._id,
            body.items
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status,
                result.details
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

export async function PATCH(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = await cartService.updateCart(
            user._id,
            body
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status,
                result.details
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

