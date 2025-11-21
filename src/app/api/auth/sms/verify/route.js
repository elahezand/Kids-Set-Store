import connectToDB from "../../../../../../db/db";
import otpMOdal from "../../../../../../model/otp";
import { generateToken } from "@/utils/auth";
import UserModal from "../../../../../../model/user";

export async function POST(req) {
    connectToDB()
    try {
        const reqBody = await req.json()
        const { code, phone } = reqBody

        const date = new Date()
        const now = date.getTime()

        const otp = await otpMOdal.findOne({ code, phone })

        if (!otp) {
            return Response.json({ message: "Code Is NOT Correct" }, { status: 422 })
        }

        const email = `${phone}@gmail.com`

        if (otp.expTime > now) {

            const isUserExsit = await UserModal.findOne({ phone })
            const users = await UserModal.find({})

            if (!isUserExsit) {
                await UserModal.create({
                    phone,
                    role: users.length < 3 ? "ADMIN" : "USER"
                })
            }

            const accessToken = await generateToken({ email })

            return Response.json({ message: "you were registerd successfully." }, {
                status: 200, headers:
                    { "Set-Cookie": `token=${accessToken};path=/;httpOnly=true;}` }
            })
        }
        else {
            return Response.json({ message: "Code IS Expires" }, { status: 410 })
        }
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })

    }
}
