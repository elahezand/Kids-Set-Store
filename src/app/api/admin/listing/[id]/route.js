import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGaurd";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";

import listingService from "@/services/listingService";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { updateListingSchema } from "@/validators/listing";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid listing ID", 400);
        }

        const result =
            await listingService.getListingPreview(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PUT(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid listing ID", 400);
        }

        const body = await request.json();

        const result = validate(
            updateListingSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await listingService.updateListing(
                id,
                result.data
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json({
            message: "Listing updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid listing ID", 400);
        }

        const result =
            await listingService.deleteListing(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            message: "Listing deleted successfully",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}
export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid listing ID", 400);
        }

        const body = await request.json();

        const result = validate(
            changeListingStatusSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await listingService.changeStatus(
                id,
                result.data.status
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json({
            message: "Listing status updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}