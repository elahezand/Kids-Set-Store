import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";

import orderService from "@/services/admin/order";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { updateAdminOrderSchema } from "@/validators/order";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid order ID", 400);
        }

        const result =
            await orderService.getOrderByIdAdmin(id);

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
            return jsonError("Invalid order ID", 400);
        }

        const body = await request.json();

        const result = validate(
            updateAdminOrderSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await orderService.updateOrder(
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
            message: "Order updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}