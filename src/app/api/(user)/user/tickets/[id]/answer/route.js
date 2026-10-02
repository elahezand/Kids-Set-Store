import connectToDB from "@/configs/db";
import ticketService from "@/services/server/shared/ticket";
import { authUser } from "@/utils/auth/authGuard";
import { ticketReplySchema } from "@/validators/ticket";
import { fromService, handleRouteError, jsonError, validationError } from "@/utils/apiResponse";

/* POST /api/user/tickets/:id/answer  { content }
   the owner replies to their ticket; an admin can reply to any ticket (admin panel uses it too) */
export async function POST(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const { id } = await params;
        const body = await request.json().catch(() => ({}));

        const parsed = ticketReplySchema.safeParse(body);
        if (!parsed.success) return validationError(parsed.error);

        const result = await ticketService.createAnswer(id, user, parsed.data.content);
        return fromService(result, { status: 201, message: "Reply sent" });
    } catch (error) {
        return handleRouteError(error);
    }
}
