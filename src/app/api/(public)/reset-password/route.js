import { compare } from "bcryptjs";
import UserModel from "@/model/user";
import redisClient from "@/configs/redis";
import connectToDB from "@/configs/db";
import { hashPassword } from "@/utils/auth";
import validate from "@/utils/validate";
import { validationError, respond } from "@/utils/apiResponse";
import { resetPasswordSchema } from "@/validators/user";

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_SECONDS = 60;

// same keys the /auth/sms/send route writes (the code is stored as a bcrypt hash)
const otpKey = (phone) => `otp:${phone}`;
const attemptsKey = (phone) => `otp:attempts:${phone}`;

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => ({}));
    const result = validate(resetPasswordSchema, body);

    if (!result.success) {
      return validationError(result.errors);
    }

    const { phone, resetCode, password } = result.data;

    const savedHash = await redisClient.get(otpKey(phone));
    if (!savedHash) {
      return respond(
        { success: false, message: "Code expired. Request a new one." },
        { status: 410 }
      );
    }

    const attempts = await redisClient.incr(attemptsKey(phone));
    if (attempts === 1) {
      await redisClient.expire(attemptsKey(phone), OTP_TTL_SECONDS);
    }
    if (attempts > MAX_OTP_ATTEMPTS) {
      await redisClient.del(otpKey(phone));
      return respond(
        { success: false, message: "Too many wrong codes. Request a new code." },
        { status: 429 }
      );
    }

    const isValid = await compare(String(resetCode), savedHash);
    if (!isValid) {
      return respond(
        { success: false, message: "Invalid reset code" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ phone }).select("_id");
    if (!user) {
      return respond(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const hashedNewPassword = await hashPassword(password);
    await UserModel.updateOne({ _id: user._id }, { $set: { password: hashedNewPassword } });

    await redisClient.del(otpKey(phone));
    await redisClient.del(attemptsKey(phone));

    return respond(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return respond(
      { success: false, message: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
