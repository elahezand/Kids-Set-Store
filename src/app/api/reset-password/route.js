import UserModel from "../../../../model/user";
import connectToDB from "../../../../db/db";
import { hashPassword } from "@/utils/auth";
export async function POST(req) {
    connectToDB()
    try {
        const body = await req.json()
        const { password, phone } = body

        const user = await UserModel.findOne({ phone })
        if (!user) return Response.json({ message: "Not FOUND" }, { status: 404 })

        const hashedNewPassword = await hashPassword(password)
        await UserModel.findOneAndUpdate({ _id: user._id },
            {
                $set: {
                    password: hashedNewPassword
                },
            })

        return Response.json({ message: "Password updated Successfully" }, { status: 200 })

    } catch {
        return Response.json({ message: "Unknown Error" }, { status: 500 })

    }
}
