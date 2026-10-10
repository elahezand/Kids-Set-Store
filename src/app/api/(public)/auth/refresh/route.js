import { respond } from "@/utils/apiResponse";
import { rotateSession } from "@/services/server/shared/session";
import authCookies from "@/utils/auth/cookies";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return respond(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const result = await rotateSession(refreshToken, req);

    if (!result.ok) {
      const response = respond(
        {
          success: false,
          message: "Session invalid",
        },
        { status: 401 }
      );

      authCookies.clearAuthCookies(response);

      return response;
    }

    const response = respond(
      {
        success: true,
        message: "Token refreshed",
      },
      { status: 200 }
    );

    authCookies.setAuthCookies(response, result);

    return response;
  } catch (err) {
    console.error("Refresh error:", err);

    return respond(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}
