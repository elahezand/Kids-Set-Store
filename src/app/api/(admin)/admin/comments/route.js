import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import commentService from "@/services/server/admin/comment";
import { adminCommentsQuerySchema } from "@/validators/comment";
import { handleRouteError, jsonError, paginated, validationError } from "@/utils/apiResponse";

/* GET /api/admin/comments?status=&productId=&userId=&q=&limit=&cursor= */
export async function GET(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin || admin.status === "expired") {
            return jsonError("Admin access required", 401);
        }

        const { searchParams } = new URL(req.url);
        const result = validate(adminCommentsQuerySchema, Object.fromEntries(searchParams.entries()));

        if (!result.success) return validationError(result.errors);

        return paginated(await commentService.getAdmin(result.data));
    } catch (err) {
        return handleRouteError(err, "GET /api/admin/comments");
    }
}
