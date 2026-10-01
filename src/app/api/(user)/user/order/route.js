import connectToDB from "@/configs/db";
import orderService from "@/services/server/user/order";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond , validationError } from "@/utils/apiResponse";
import validate from "@/utils/validate";
import { checkoutSchema } from "@/validators/order";

export async function GET(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = await orderService.getMyOrders(
            user._id,
            query
        );

        return respond({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json().catch(() => ({}));
        const parsed = validate(checkoutSchema, body);

        if (!parsed.success) {
            return validationError(parsed.errors);
        }

        const { shippingAddress, paymentMethod, idempotencyKey, useWallet } = parsed.data;

        const result = await orderService.checkout(
            user._id,
            shippingAddress,
            paymentMethod,
            idempotencyKey || null,
            useWallet || false
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status,
                result.details
            );
        }

        return respond(
            {
                success: true,
                data: result.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}