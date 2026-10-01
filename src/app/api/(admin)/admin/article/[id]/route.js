import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";

import articleService from "@/services/server/admin/article";

import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";

import { updateArticleSchema } from "@/validators/article";

const guard = async (id) => {
    const admin = await authAdmin();

    if (!admin) {
        return {
            error: jsonError("Unauthorized", 401),
        };
    }

    if (!validateObjectId(id)) {
        return {
            error: jsonError("Invalid article ID", 400),
        };
    }

    return { admin };
};

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        const auth = await guard(id);

        if (auth.error) {
            return auth.error;
        }

        const result = await articleService.getArticleByIdAdmin(id);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        const auth = await guard(id);

        if (auth.error) {
            return auth.error;
        }

        const body = await request.json();

        const result = validate(updateArticleSchema, body);

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult = await articleService.updateArticle(
            id,
            result.data
        );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond({
            message: "Article updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        const auth = await guard(id);

        if (auth.error) {
            return auth.error;
        }

        const result = await articleService.deleteArticle(id);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            message: "Article deleted successfully",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}