import connectToDB from "@/configs/db";
import validateObjectId from "@/utils/validateObjectId";
import articleService from "@/services/server/public/article";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid article ID", 400);
        }

        const result = await articleService.getPublicArticleById(id);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}