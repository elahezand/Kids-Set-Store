import connectToDB from "@/configs/db";
import notificationService from "@/services/server/user/notification";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, paginated } from "@/utils/apiResponse";

export async function GET(request) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

    const query = Object.fromEntries(new URL(request.url).searchParams.entries());
    const result = await notificationService.getAll(user._id, query);

    if (!result.success) return jsonError(result.message, result.status);

    return paginated(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
