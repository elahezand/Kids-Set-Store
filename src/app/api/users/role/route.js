import { authAdmin } from "@/utils/serverHelper"
import connectToDB from "../../../../../db/db"
import UserModal from "../../../../../model/user"
import { isValidObjectId } from "mongoose"
export async function PUT(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")


        if (user.role === "ADMIN") {
            const reqBody = await req.json()

            const { userID } = reqBody

            const isvalidId = isValidObjectId(userID)
            if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

            const user = await UserModal.findOne({ _id: userID })

            await UserModal.findOneAndUpdate({ _id: userID }, {
                $set: {
                    role: user.role === "ADMIN" ? "USER" : "ADMIN"
                }
            })
        }
        return Response.json({ user }, { status: 200 })

    }
    catch (err) {
        return Response.json({ message: "UnKnownError" }, { status: 500 })
    }

}

