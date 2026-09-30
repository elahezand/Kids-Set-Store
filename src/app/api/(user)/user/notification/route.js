import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import notificationService from "@/services/user/notification";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const result = await notificationService.getAll(user._id);

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