import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import validate from "@/utils/validate";
import orderService from "@/services/server/admin/order";
import { fromService, handleRouteError, jsonError, validationError } from "@/utils/apiResponse";
import { deliveryEstimateSchema } from "@/validators/order";

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const { id } = await params;
        if (!validateObjectId(id)) return jsonError("Invalid order ID", 400);

        const body = await request.json().catch(() => null);
        if (!body) return jsonError("Invalid JSON body", 400);

        const result = validate(deliveryEstimateSchema, body);
        if (!result.success) return validationError(result.errors);

        return fromService(await orderService.adminSetDeliveryEstimate(id, result.data.estimatedDeliveryAt), {
            message: "Delivery estimate updated",
        });
    } catch (error) {
        return handleRouteError(error, "PATCH /api/admin/order/:id/delivery");
    }
}
