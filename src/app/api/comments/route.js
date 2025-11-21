import connectToDB from "../../../../db/db";
import commentModel from "../../../../model/comment";
import ProductModal from "../../../../model/product";
import UserModal from "../../../../model/user";
import { validateEmail, validateUserNane } from "../../../../validator/user";
export async function GET() {
    try {
        connectToDB()
        const comments = await commentModel.find({}, "-__v")
            .populate("userID", "username")
            .lean()
        return Response.json(comments, { status: 200 })
    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
export async function POST(req) {
    try {
        connectToDB()
        const reqBody = await req.json()

        const { username, body, email, score, productID, userID, isAccept } = reqBody

        const isValidUsername = validateUserNane(username)
        const isValidEmail = validateEmail(email)

        if (!isValidEmail || !isValidUsername) return Response.json({ message: "Email or Usename Not Correct" }, { status: 422 })

        const comment = await commentModel.create({
            username, body, email, score, productID, userID, isAccept
        })
        await ProductModal.findOneAndUpdate({ _id: productID }, {
            $push: {
                comments: comment._id
            }
        })

        return Response.json({ message: "Comment sended Successfully" }, { status: 200 })
    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}



