import connectToDB from "@/configs/db";
import newsletterService from "@/services/server/public/newsletter";
import validate from "@/utils/validate";
import { handleRouteError, jsonError, validationError, respond } from "@/utils/apiResponse";
import { newsletterSchema } from "@/validators/newsletter";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();

        const result = validate(
            newsletterSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await newsletterService.subscribe(
                result.data.email
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return respond(
            {
                success: true,
                message: "Subscribed successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}