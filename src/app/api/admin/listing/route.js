import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGaurd";
import validate from "@/utils/validate";

import listingService from "@/services/listingService";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import {
    adminListingsQuerySchema,
    createStoreProductSchema,
} from "@/validators/listing";

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
            adminListingsQuerySchema,
            query
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const data = await listingService.getAllListingsAdmin(
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

        const result = validate(
            createStoreProductSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await listingService.createStoreProduct(
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
                message: "Store product created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}