import connectToDB from "@/configs/db";
import ticketService from "@/services/server/user/ticket";
import { authUser } from "@/utils/auth/authGuard";
import { fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

/* GET /api/user/departments  -> departments with their sub-departments (ticket form) */
export async function GET() {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        return fromService(await ticketService.getDepartments());
    } catch (error) {
        return handleRouteError(error);
    }
}
