import commentModel from "../../../../../model/comment"
import connectToDB from "../../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"

export async function POST(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const reqBody = await req.json()
        const { answer, commentID } = reqBody

        const isvalidId = isValidObjectId(commentID)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        await commentModel.findOneAndUpdate({ _id: commentID }, {
            $push: {
                answer: answer
            }
        })

        return Response.json({ message: "Comment sended Successfully" }, { status: 200 })
    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}



