import connectToDB from "../../../../../db/db"
import commentModel from "../../../../../model/comment"
import { authAdmin } from "@/utils/serverHelper"
import { isValidObjectId } from "mongoose"

export async function PUT(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json()
        const { commentID } = body

        const isvalidId = isValidObjectId(commentID)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })


        await commentModel.findOneAndUpdate({ _id: commentID },
            [
                {
                    $set: {
                        isAccept: { $not: "$isAccept" }
                    }
                }
            ])

        return Response.json({ message: "Comment Status Changed Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
