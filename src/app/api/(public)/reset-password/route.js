import UserModel from "@/model/user";
import connectToDB from "@/configs/db";
import { hashPassword } from "@/utils/auth";
import { verifyOtp } from "@/services/server/shared/otp";
import { revokeAllUserSessions } from "@/services/server/shared/session";
import validate from "@/utils/validate";
import { resetPasswordSchema } from "@/validators/user";
import { getClientIp, rateLimit } from "@/utils/rateLimit";
import { handleRouteError, jsonError, respond, validationError } from "@/utils/apiResponse";

export async function POST(req) {
  try {
    await connectToDB();

    const limited = await rateLimit([{ key: `reset:ip:${getClientIp(req)}`, limit: 10, window: 15 * 60 }]);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const result = validate(resetPasswordSchema, body);

    if (!result.success) {
      return validationError(result.errors);
    }

    const { phone, resetCode, password } = result.data;

    const otp = await verifyOtp(phone, resetCode);
    if (!otp.success) {
      return jsonError(otp.message, otp.status);
    }

    const user = await UserModel.findOne({ phone }).select("_id");
    if (!user) {
      return jsonError("Invalid code", 400);
    }

    await UserModel.updateOne({ _id: user._id }, { $set: { password: await hashPassword(password) } });
    await revokeAllUserSessions(user._id, "password_changed");

    return respond({ success: true, message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    return handleRouteError(error, "POST /api/reset-password");
  }
}
