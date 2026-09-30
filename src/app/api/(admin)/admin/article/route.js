import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import articleService from "@/services/admin/article";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import {
    adminArticlesQuerySchema,
    createArticleSchema,
} from "@/validators/article";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = validate(adminArticlesQuerySchema, query);

        if (!result.success) {
            return validationError(result.errors);
        }

        const data = await articleService.getAllArticlesAdmin(
            result.data
        );

        return NextResponse.json({
            data: data.data,
            pagination: data.pagination,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request) {
    try {
        await connectToDB();
        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = validate(createArticleSchema, body);

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult = await articleService.createArticle(
            admin._id,
            result.data
        );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json(
            {
                message: "Article created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}