import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";

import productService from "@/services/admin/product";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { updateProductSchema } from "@/validators/product";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid product ID", 400);
        }

        const result =
            await productService.getProductPreview(id);

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
            return jsonError("Invalid product ID", 400);
        }

        const body = await request.json();

        const result = validate(
            updateProductSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await productService.updateProduct(
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
            message: "Product updated successfully",
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
            return jsonError("Invalid product ID", 400);
        }

        const result =
            await productService.deleteProduct(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            message: "Product deleted successfully",
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
            return jsonError("Invalid product ID", 400);
        }

        const body = await request.json();

        const result = validate(
            changeProductStatusSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await productService.changeStatus(
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
            message: "Product status updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}