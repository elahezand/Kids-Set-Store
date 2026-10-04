import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import productService from "@/services/server/admin/product";

import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";

import {
    adminProductsQuerySchema,
    createProductSchema,
} from "@/validators/product";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin || admin.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = validate(
            adminProductsQuerySchema,
            query
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const data = await productService.getAllProductsAdmin(
            result.data
        );

        return respond({
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

        if (!admin || admin.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = validate(
            createProductSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await productService.createStoreProduct(
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
                message: "Store product created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}