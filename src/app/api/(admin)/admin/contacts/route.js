import connectToDB from "@/configs/db";
import {
    adminContactsQuerySchema,
} from "@/validators/contact";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import contactService from "@/services/server/admin/contact";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

export async function GET(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin || admin.status === "expired") {
            return jsonError(
                "Admin access required",
                401
            );
        }

        const { searchParams } =
            new URL(req.url);

        const query =
            Object.fromEntries(
                searchParams.entries()
            );

        const result = validate(
            adminContactsQuerySchema,
            query
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await contactService.getContacts(
                result.data
            );

        return respond(
            {
                data: serviceResult.data,
                pagination: serviceResult.pagination,
                meta: serviceResult.meta,
                unreadCount:
                    serviceResult.unreadCount,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/contacts"
        );
    }
}