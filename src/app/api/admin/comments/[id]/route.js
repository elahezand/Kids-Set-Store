import { NextResponse } from "next/server";
import connectToDB from "../../../../../../configs/db";
import {
    replyCommentSchema,
} from "../../../../../../validators/comment";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import validateObjectId from "@/utils/api/validateObjectId";
import commentService from "@/services/api/admin/commentServic";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

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

        return NextResponse.json(
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