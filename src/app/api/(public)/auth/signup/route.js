import UserModel from "@/model/user";
import connectToDB from "@/configs/db";
import { hashPassword } from "@/utils/auth";
import { isBanned } from "@/utils/auth/ban";
import { userValidationSchema } from "@/validators/user";
import sessionService from "@/services/server/shared/session";
import validate from "@/utils/validate";
import authCookies from "@/utils/auth/cookies";
import { getClientIp, rateLimit } from "@/utils/rateLimit";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectToDB();

    const limited = await rateLimit([{ key: `signup:ip:${getClientIp(req)}`, limit: 5, window: 60 * 60 }]);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const result = validate(userValidationSchema, body);

    if (!result.success) {
      return jsonError("Invalid data", 422, result.errors);
    }

    const { username, email, password, phone } = result.data;

    if (await isBanned(phone)) {
      return jsonError("This phone number is banned", 403);
    }

    const isUserExist = await UserModel.exists({
      $or: [{ phone }, ...(email ? [{ email }] : []), { username }],
    });

    if (isUserExist) {
      return jsonError("User already exists with this info", 409);
    }

    const newUser = await UserModel.create({
      username,
      ...(email ? { email } : {}),
      phone,
      password: await hashPassword(password),
      role: ["USER"],
    });

    const tokens = await sessionService.createSession(newUser, req);

    const response = respond(
      {
        success: true,
        message: "Registered successfully",
        data: { user: newUser.toObject() },
      },
      { status: 201 }
    );

    authCookies.setAuthCookies(response, tokens);

    return response;
  } catch (error) {
    return handleRouteError(error, "POST /api/auth/signup");
  }
}
