import connectToDB from "@/configs/db";
import categoryService from "@/services/server/public/category";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request, { params }) {
  try {
    await connectToDB();

    const { slug } = await params;

    const data = await categoryService.getCategoryBySlug(slug);

    if (!data) {
      return jsonError("Category not found", 404);
    }

    return respond({
      success: true,
      data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
