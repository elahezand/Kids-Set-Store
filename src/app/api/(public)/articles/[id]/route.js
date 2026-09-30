import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import validateObjectId from "@/utils/validateObjectId";
import articleService from "@/services/public/article";
import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

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

        return NextResponse.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}