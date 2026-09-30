import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import userService from "@/services/admin/user";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return jsonError("Unauthorized", 401);

        const result = await userService.getAdmins();

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}