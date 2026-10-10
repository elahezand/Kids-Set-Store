import connectToDB from "@/configs/db";
import favoriteService from "@/services/server/public/favorite";
import { handleRouteError, respond } from "@/utils/apiResponse";

export async function GET(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    const data = await favoriteService.getPopularProducts(query);

    return respond({
      success: true,
      data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
