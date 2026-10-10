import connectToDB from "@/configs/db";
import infoService from "@/services/server/public/info";
import { handleRouteError, respond } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectToDB();

    const data = await infoService.getInfo();

    return respond({
      success: true,
      data,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
