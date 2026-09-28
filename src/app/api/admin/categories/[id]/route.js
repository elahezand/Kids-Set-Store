import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import { createCategorySchema } from "../../../../../validators/category";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import categoryService from "@/services/api/admin/categoryService";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

export async function POST(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
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
            createCategorySchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await categoryService.createCategory(
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
                message:
                    "Category created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "POST /api/admin/categories"
        );
    }
}