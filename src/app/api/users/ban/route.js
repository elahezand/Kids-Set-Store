import connectToDB from "../../../../../configs/db";
import BanModal from "../../../../../model/ban";
import { authAdmin } from "@/utils/serverHelper";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectToDB();
        const admin = await authAdmin();
        if (!admin) throw new Error("This API is protected");

        const { email, username } = await req.json();
        const userExist = await BanModal.findOne({
            $or: [
                { email },
                { username }
            ]
        });
        if (!userExist) {
            await BanModal.create({ username, email });
        }
        await UserModal.findOneAndDelete({
            $or: [
                { email },
                { username }
            ]
        })
        return NextResponse.json({ message: "User banned successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
