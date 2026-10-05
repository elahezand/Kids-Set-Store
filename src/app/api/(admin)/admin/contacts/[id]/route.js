import connectToDB from "@/configs/db";
import {
    updateContactSchema,
    answerContactSchema,
} from "@/validators/contact";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import validateObjectId from "@/utils/validateObjectId";
import contactService from "@/services/server/admin/contact";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

const guard = async (params) => {
    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
        return {
            error: jsonError(
                "Admin access required",
                401
            ),
        };
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
        return {
            error: jsonError(
                "Message not found",
                404
            ),
        };
    }

    return {
        admin,
        id,
    };
};

export async function GET(req, { params }) {
    try {
        await connectToDB();

        const {
            admin,
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const result =
            await contactService.getContactById(
                id,
                admin._id
            );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return respond(
            {
                data: result.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/contacts/:id"
        );
    }
}

export async function POST(req, { params }) {
    try {
        await connectToDB();

        const {
            admin,
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const body = await req
            .json()
            .catch(() => null);

        if (!body) {
            return jsonError(
                "Invalid JSON body",
                400
            );
        }

        const result = validate(
            answerContactSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await contactService.answerContact(
                id,
                admin._id,
                result.data.answer
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond(
            {
                message:
                    "Answer sent successfully",
                data: serviceResult.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "POST /api/admin/contacts/:id"
        );
    }
}

export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const {
            admin,
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const body = await req
            .json()
            .catch(() => null);

        if (!body) {
            return jsonError(
                "Invalid JSON body",
                400
            );
        }

        const result = validate(
            updateContactSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await contactService.updateContact(
                id,
                admin._id,
                result.data
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond(
            {
                message:
                    "Message updated successfully",
                data: serviceResult.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "PUT /api/admin/contacts/:id"
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const serviceResult =
            await contactService.deleteContact(
                id
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond(
            {
                message:
                    "Message removed successfully",
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "DELETE /api/admin/contacts/:id"
        );
    }
}