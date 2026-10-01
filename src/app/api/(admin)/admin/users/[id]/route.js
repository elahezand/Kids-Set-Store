import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import userService from "@/services/server/admin/user";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return jsonError("Unauthorized", 401);

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid user ID", 400);
        }

        const result = await userService.removeUser(id, admin._id);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            message: "User removed successfully",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}