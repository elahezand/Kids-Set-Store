import { revokeSession } from "@/services/server/shared/session";
import { verifyRefreshToken } from "@/utils/auth";
import authCookies from "@/utils/auth/cookies";
import { handleRouteError, respond } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.sid) await revokeSession(payload.sid, "logout");
    }

    const response = respond({ success: true, message: "Logged out" }, { status: 200 });
    authCookies.clearAuthCookies(response);

    return response;
  } catch (error) {
    return handleRouteError(error, "POST /api/auth/logout");
  }
}
