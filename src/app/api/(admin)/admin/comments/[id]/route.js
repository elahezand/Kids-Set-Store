import connectToDB from "@/configs/db";
import {
    replyCommentSchema,
} from "@/validators/comment";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import validateObjectId from "@/utils/validateObjectId";
import commentService from "@/services/server/admin/comment";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

export async function POST(req, { params }) {
    try {
        await connectToDB();
        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
            );
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError(
                "Comment not found",
                404
            );
        }

        const body = await req.json().catch(
            () => null
        );

        if (!body) {
            return jsonError(
                "Invalid JSON body",
                400
            );
        }

        const result = validate(
            replyCommentSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const resultService =
            await commentService.replyToComment(
                admin._id,
                id,
                result.data.body
            );

        if (!resultService.success) {
            return jsonError(
                resultService.message,
                resultService.status
            );
        }

        return respond(
            {
                message:
                    "Reply added successfully",
                data: resultService.data,
            },
            { status: 201 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "POST /api/admin/comments/:id"
        );
    }
}