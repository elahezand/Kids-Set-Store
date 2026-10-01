import connectToDB from "@/configs/db";
import orderService from "@/services/server/public/order";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();
        const result = await orderService.verify(
            body.authority
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