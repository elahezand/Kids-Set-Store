import connectToDB from "@/configs/db";
import orderService from "@/services/server/user/order";
import { authUser } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid order id", 400);
        }

        const result = await orderService.getOrderById(
            id,
            user._id
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid order id", 400);
        }

        const body = await request.json();

        const result = await orderService.updateOrderByOwner(
            id,
            user._id,
            body
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}