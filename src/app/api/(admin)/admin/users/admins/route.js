import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import userService from "@/services/server/admin/user";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const result = await userService.getAdmins();

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}