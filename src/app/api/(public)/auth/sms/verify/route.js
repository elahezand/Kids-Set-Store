import User from "@/model/user";
import connectToDB from "@/configs/db";
import { isBanned } from "@/utils/auth/ban";
import { verifyOtp } from "@/services/server/shared/otp";
import sessionService from "@/services/server/shared/session";
import authCookies from "@/utils/auth/cookies";
import { otpCodeSchema, phoneSchema } from "@/validators/authForm";
import { getClientIp, rateLimit } from "@/utils/rateLimit";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => ({}));
    const phone = phoneSchema.safeParse(body.phone);
    const code = otpCodeSchema.safeParse(String(body.code ?? ""));

    if (!phone.success || !code.success) {
      return jsonError("Phone and code are required", 422);
    }

    const limited = await rateLimit([{ key: `otp-verify:ip:${getClientIp(req)}`, limit: 30, window: 15 * 60 }]);
    if (limited) return limited;

    if (await isBanned(phone.data)) {
      return jsonError("This phone number is banned", 403);
    }

    const result = await verifyOtp(phone.data, code.data);
    if (!result.success) {
      return jsonError(result.message, result.status);
    }

    let user = await User.findOne({ phone: phone.data });

    if (!user) {
      user = await User.create({
        phone: phone.data,
        username: `User${phone.data.slice(-4)}`,
        role: ["USER"],
      });
    }

    const tokens = await sessionService.createSession(user, req);

    const response = respond(
      {
        success: true,
        message: "Login successful",
        data: { user: user.toObject() },
      },
      { status: 200 }
    );

    authCookies.setAuthCookies(response, tokens);

    return response;
  } catch (error) {
    return handleRouteError(error, "POST /api/auth/sms/verify");
  }
}
