import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGaurd";
import validate from "@/utils/validate";

import newsletterService from "@/services/newsletterService";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { adminNewsletterQuerySchema } from "@/validators/newsletter";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = validate(
            adminNewsletterQuerySchema,
            query
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const data = await newsletterService.getAll(
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