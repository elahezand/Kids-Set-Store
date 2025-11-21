import BanModal from "../../../../../model/ban"
import connectToDB from "../../../../../db/db"
import UserModal from "../../../../../model/user"
import { authAdmin } from "@/utils/serverHelper"

export async function GET(req) {
    try {
        connectToDB()
        const admin = await authAdmin()

        if (!admin) throw new Error("This api Protected")


        const bans = BanModal.find({}).populate("userID", "phone email")

        return Response.json({ bans }, { status: 200 })
    } catch (err) {
        return Response.json({ message: "Unknown Error" }, { status: 500 })

    }
}

export async function POST(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const reqBody = await req.json()

        const { user, email } = reqBody

        const userExist = await BanModal.findOne({ _id: user })

        await UserModal.findOneAndDelete({ _id: user })

        if (!userExist) {
            await BanModal.create({
                user,
                email
            })
        }

        return Response.json({}, { status: 200 })
    } catch (err) {

        return Response.json({ message: "Unknown Error" }, { status: 500 })

    }
}


