import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import commentService from "@/services/user/comment";
import { authUser } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid comment id", 422);
        }

        const body = await request.json();

        const result = await commentService.updateOwn(
            user._id,
            id,
            body
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid comment id", 422);
        }

        const result = await commentService.deleteOwn(
            user._id,
            id
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}