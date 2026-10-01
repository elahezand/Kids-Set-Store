import connectToDB from "@/configs/db";
import couponService from "@/services/server/user/coupon";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        if (!body.code) {
            return jsonError("Coupon code is required", 400);
        }

        const result = await couponService.validateCoupon(body.code);

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}