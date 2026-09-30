import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";

import cartService from "@/services/admin/cart";

import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid cart ID", 400);
        }

        const result = await cartService.getCartById(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid cart ID", 400);
        }

        const result = await cartService.deleteCart(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            message: "Cart deleted successfully",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}