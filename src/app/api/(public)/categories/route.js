import connectToDB from "@/configs/db";
import categoryService from "@/services/server/public/category";
import { handleRouteError, respond } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const data = await categoryService.getAllCategories();

        return respond({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}