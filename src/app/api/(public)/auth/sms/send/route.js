import connectToDB from "@/configs/db";
import { isBanned } from "@/utils/auth/ban";
import { sendOtp } from "@/services/server/shared/otp";
import { phoneSchema } from "@/validators/authForm";
import { getClientIp, rateLimit } from "@/utils/rateLimit";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => ({}));
    const parsed = phoneSchema.safeParse(body.phone);

    if (!parsed.success) {
      return jsonError("Enter a valid phone number", 422);
    }

    const phone = parsed.data;

    const limited = await rateLimit([
      { key: `otp:ip:${getClientIp(req)}`, limit: 10, window: 15 * 60 },
      { key: `otp:phone:${phone}`, limit: 5, window: 60 * 60 },
    ]);
    if (limited) return limited;

    if (await isBanned(phone)) {
      return jsonError("This phone number is banned", 403);
    }

    const result = await sendOtp(phone);

    return respond(
      { success: result.success, message: result.message, data: result.data },
      { status: result.success ? 200 : result.status }
    );
  } catch (error) {
    return handleRouteError(error, "POST /api/auth/sms/send");
  }
}
