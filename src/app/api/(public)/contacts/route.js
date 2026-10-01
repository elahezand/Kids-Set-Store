import connectToDB from "@/configs/db";
import contactService from "@/services/server/public/contact";
import { handleRouteError, validationError, respond } from "@/utils/apiResponse";
import validate from "@/utils/validate";
import { contactSchema } from "@/validators/contact";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();

        const result = validate(contactSchema, body);

        if (!result.success) {
            return validationError(result.errors);
        }

        const contact = await contactService.createContact(
            result.data
        );

        return respond(
            {
                success: true,
                message: "Contact submitted successfully",
                data: contact,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}