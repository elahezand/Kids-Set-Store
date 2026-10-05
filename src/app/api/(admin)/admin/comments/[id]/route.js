import connectToDB from "@/configs/db";
import { deleteCommentSchema, moderateCommentSchema, replyCommentSchema } from "@/validators/comment";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import validateObjectId from "@/utils/validateObjectId";
import commentService from "@/services/server/admin/comment";
import { fromService, handleRouteError, jsonError, validationError } from "@/utils/apiResponse";

const guard = async (params) => {
    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
        return { error: jsonError("Admin access required", 401) };
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
        return { error: jsonError("Comment not found", 404) };
    }

    return { admin, id };
};

const readBody = (req) => req.json().catch(() => null);

export async function POST(req, { params }) {
    try {
        await connectToDB();

        const { admin, id, error } = await guard(params);
        if (error) return error;

        const body = await readBody(req);
        if (!body) return jsonError("Invalid JSON body", 400);

        const result = validate(replyCommentSchema, body);
        if (!result.success) return validationError(result.errors);

        return fromService(await commentService.replyToComment(admin._id, id, result.data.body), {
            status: 201,
            message: "Reply added successfully",
        });
    } catch (err) {
        return handleRouteError(err, "POST /api/admin/comments/:id");
    }
}

export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const { admin, id, error } = await guard(params);
        if (error) return error;

        const body = await readBody(req);
        if (!body) return jsonError("Invalid JSON body", 400);

        const result = validate(moderateCommentSchema, body);
        if (!result.success) return validationError(result.errors);

        return fromService(await commentService.moderate(id, admin._id, result.data), {
            message: "Comment status updated",
        });
    } catch (err) {
        return handleRouteError(err, "PUT /api/admin/comments/:id");
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const { admin, id, error } = await guard(params);
        if (error) return error;

        const result = validate(deleteCommentSchema, (await readBody(req)) ?? {});
        if (!result.success) return validationError(result.errors);

        return fromService(await commentService.adminDelete(id, admin._id, result.data.reason), {
            message: "Comment deleted",
        });
    } catch (err) {
        return handleRouteError(err, "DELETE /api/admin/comments/:id");
    }
}
