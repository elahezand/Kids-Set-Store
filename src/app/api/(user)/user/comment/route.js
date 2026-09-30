import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import commentService from "@/services/user/comment";
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

        const result = await commentService.create(user._id, body);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json(
            {
                success: true,
                data: result.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}