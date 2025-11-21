import TicketModel from "../../../../../model/ticket";
import connectToDB from "../../../../../db/db";
import { authAdmin, authUser } from "@/utils/serverHelper";
import { isValidObjectId } from "mongoose";


export async function GET(req, { params }) {
    try {
        connectToDB()
        const { id } = await params

        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const Ticket = await TicketModel.findOne({ _id: id }, "-__v")
            .populate("userID", "username")
            .lean()
        return Response.json(Ticket, { status: 200 })

    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}

export async function PATCH(req, { params }) {

    try {
        connectToDB()
        const user = await authUser()
        const { id } = await params

        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const body = await req.json()
        const { content } = body

        await TicketModel.findOneAndUpdate({ _id: id }, {
            $push: {
                message: { senderID: user._id, content: content }
            },
            $set: {
                answerBy: user.role
            }
        })
        return Response.json({ message: "ticket sent" }, { status: 200 })
    }
    catch (err) {
        console.log(err);

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}

export async function DELETE(req, { params }) {

    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params
        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        await TicketModel.findOneAndDelete({ _id: id })

        return Response.json({ message: "ticket Removed" }, { status: 200 })
    }
    catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}




