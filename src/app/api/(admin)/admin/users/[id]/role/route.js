import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import userService from "@/services/admin/user";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return jsonError("Unauthorized", 401);

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid user ID", 400);
        }

        const result = await userService.toggleRole(id, admin._id);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json({
            success: true,
            message: "Role updated successfully",
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}