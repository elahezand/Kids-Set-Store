import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";

import orderService from "@/services/server/admin/order";

import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(request, { params }) {
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
            await orderService.repairOrder(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return respond({
            message: "Order repaired successfully",
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}