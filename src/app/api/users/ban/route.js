import connectToDB from "../../../../../configs/db";
import BanModel from "../../../../../model/ban";
import UserModel from "../../../../../model/user";
import { authAdmin } from "@/utils/serverHelper";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToDB();
    const admin = await authAdmin();
    if (!admin) throw new Error("This API is protected");

    const { email, user } = await req.json();

    const userExist = await BanModel.findOne({
      $or: [{ email }, { user }]
    });
    

    if (!userExist) {
      await BanModel.create({ user, email });
    }

    await UserModel.findOneAndDelete({
      $or: [{ email }, { _id: user }]
    });

    return NextResponse.json({ message: "User banned successfully" }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
