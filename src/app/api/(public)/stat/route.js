import connectToDB from "@/configs/db";
import statsService from "@/services/server/public/stats";
import { handleRouteError, respond } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectToDB();

    const data = await statsService.getPublicStats();

    return respond({
      success: true,
      data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
