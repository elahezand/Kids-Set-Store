import connectToDB from "@/configs/db";
import validateObjectId from "@/utils/validateObjectId";
import productService from "@/services/server/public/product";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid product ID", 400);
        }

        const result = await productService.getProductById(id);

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