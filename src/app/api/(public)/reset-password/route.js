import UserModel from "@/model/user";
import redisClient from "@/configs/redis";
import connectToDB from "@/configs/db";
import { hashPassword } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();
    const { password, phone, resetCode } = body;

    if (!resetCode) {
      return NextResponse.json(
        { message: "Reset code is required" },
        { status: 400 }
      );
    }

    // same key the /auth/sms/send route writes (expiry is handled by the TTL)
    const savedCode = await redisClient.get(`otp:${phone}`);
    if (!savedCode || String(savedCode) !== String(resetCode)) {
      return NextResponse.json(
        { message: "Invalid reset code" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ phone });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const hashedNewPassword = await hashPassword(password);
    await UserModel.findByIdAndUpdate(user._id, { password: hashedNewPassword });

    await redisClient.del(`otp:${phone}`);

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );

  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { message: "Unknown error occurred" },
      { status: 500 }
    );
  }
}