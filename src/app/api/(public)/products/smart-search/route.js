import connectToDB from "@/configs/db";
import productService from "@/services/server/public/product";
import validate from "@/utils/validate";
import { handleRouteError, validationError, respond } from "@/utils/apiResponse";
import { smartSearchSchema } from "@/validators/product";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();

        const result = validate(
            smartSearchSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await productService.smartSearch(result.data);

        if (!serviceResult.success) {
            return respond(
                {
                    success: false,
                    message: serviceResult.message,
                },
                { status: serviceResult.status }
            );
        }

        return respond({
            success: true,
            data: serviceResult.data,
            reason: serviceResult.reason,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}