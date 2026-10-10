import UserModel from "@/model/user";
import connectToDB from "@/configs/db";
import { verifyPassword } from "@/utils/auth";
import { isBanned } from "@/utils/auth/ban";
import { createSession } from "@/services/server/shared/session";
import authSchema from "@/validators/auth";
import validate from "@/utils/validate";
import authCookies from "@/utils/auth/cookies";
import { clearLimit, getClientIp, rateLimit } from "@/utils/rateLimit";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

const INVALID_CREDENTIALS = "Invalid username or password";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => ({}));
    const result = validate(authSchema, body);

    if (!result.success) {
      return jsonError("Invalid data", 422, result.errors);
    }

    const { identifier, password, remember } = result.data;
    const accountKey = `signin:account:${identifier.toLowerCase()}`;

    const limited = await rateLimit([
      { key: `signin:ip:${getClientIp(req)}`, limit: 20, window: 15 * 60 },
      { key: accountKey, limit: 5, window: 15 * 60 },
    ]);
    if (limited) return limited;

    const user = await UserModel.findOne({
      $or: [{ phone: identifier }, { email: identifier.toLowerCase() }, { username: identifier }],
    }).select("+password");

    if (!user || !user.password) {
      return jsonError(INVALID_CREDENTIALS, 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return jsonError(INVALID_CREDENTIALS, 401);
    }

    if (await isBanned(user.phone)) {
      return jsonError("This account is banned", 403);
    }

    await clearLimit(accountKey);

    const tokens = await createSession(user, req);

    const response = respond(
      {
        success: true,
        message: "Logged in successfully",
        data: { user: user.toObject() },
      },
      { status: 200 }
    );

    authCookies.setAuthCookies(response, tokens, { remember: Boolean(remember) });

    return response;
  } catch (error) {
    return handleRouteError(error, "POST /api/auth/signin");
  }
}
