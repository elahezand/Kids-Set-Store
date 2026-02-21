import UserModel from "../../../../model/user";
import otpModel from "../../../../model/otp";
import connectToDB from "../../../../db/db";
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

    const otpEntry = await otpModel.findOne({ phone, code: resetCode });
    if (!otpEntry) {
      return NextResponse.json(
        { message: "Invalid reset code" },
        { status: 400 }
      );
    }

    if (Date.now() > otpEntry.expTime) {
      return NextResponse.json(
        { message: "Reset code expired" },
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

    await otpModel.deleteOne({ _id: otpEntry._id });

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