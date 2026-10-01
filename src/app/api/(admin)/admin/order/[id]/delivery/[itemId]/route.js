import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";

import orderService from "@/services/server/admin/order";

import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";

import { deliveryEstimateSchema } from "@/validators/order";

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
            deliveryEstimateSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await orderService.adminSetDeliveryEstimate(
                id,
                itemId,
                result.data.estimatedDeliveryAt
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond({
            message: "Delivery estimate updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}