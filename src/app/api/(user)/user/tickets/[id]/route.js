import connectToDB from "@/configs/db";
import ticketService from "@/services/server/user/ticket";
import { authUser } from "@/utils/auth/authGuard";
import { fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const { id } = await params;
        return fromService(await ticketService.getMyTicket(id, user._id));
    } catch (error) {
        return handleRouteError(error);
    }
}
