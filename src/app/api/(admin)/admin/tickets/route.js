import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import ticketService from "@/services/server/admin/ticket";
import { handleRouteError, jsonError, paginated, validationError } from "@/utils/apiResponse";
import { adminTicketsQuerySchema } from "@/validators/ticket";

/* GET /api/admin/tickets?status=waiting|answered&q=&limit=&cursor=
   replies go through POST /api/user/tickets/:id/answer (admins may answer any ticket) */
export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const { searchParams } = new URL(request.url);
        const result = validate(adminTicketsQuerySchema, Object.fromEntries(searchParams.entries()));

        if (!result.success) return validationError(result.errors);

        return paginated(await ticketService.getAllTickets(result.data));
    } catch (error) {
        return handleRouteError(error);
    }
}
