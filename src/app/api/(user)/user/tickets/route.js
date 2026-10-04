import connectToDB from "@/configs/db";
import ticketService from "@/services/server/user/ticket";
import { authUser } from "@/utils/auth/authGuard";
import { fromService, handleRouteError, jsonError, paginated } from "@/utils/apiResponse";

const currentUser = async () => {
    const user = await authUser();
    return user && user.status !== "expired" ? user : null;
};

/* GET /api/user/tickets?q=&limit=&cursor=  -> the user's tickets (newest first) */
export async function GET(request) {
    try {
        await connectToDB();

        const user = await currentUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const query = Object.fromEntries(new URL(request.url).searchParams.entries());
        return paginated(await ticketService.getMyTickets(user._id, query));
    } catch (error) {
        return handleRouteError(error);
    }
}

/* POST /api/user/tickets  { title, department, subDepartment, priority, content } */
export async function POST(request) {
    try {
        await connectToDB();

        const user = await currentUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const body = await request.json().catch(() => ({}));
        const result = await ticketService.createTicket(user._id, body);

        return fromService(result, { status: 201, message: "Ticket sent" });
    } catch (error) {
        return handleRouteError(error);
    }
}
