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

import { adminShipItemSchema } from "@/validators/order";

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { id, itemId } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid order ID", 400);
        }

        if (!validateObjectId(itemId)) {
            return jsonError("Invalid item ID", 400);
        }

        const body = await request.json();

        const result = validate(
            adminShipItemSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await orderService.adminShipItem(
                id,
                itemId,
                result.data.trackingCode,
                result.data.estimatedDeliveryAt ?? null
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json({
            message: "Item marked as shipped successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}