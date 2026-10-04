import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";

import orderService from "@/services/server/admin/order";

import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin || admin.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const data =
            await orderService.getStuckOrders();

        return respond({
            data: data.data,
            pagination: data.pagination,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}