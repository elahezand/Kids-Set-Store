import connectToDB from "../../../../../db/db"
import commentModel from "../../../../../model/comment"
import { authAdmin } from "@/utils/serverHelper"
import { isValidObjectId } from "mongoose"


export async function GET(req, { params }) {
    try {
        connectToDB()
        const { id } = await params

        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const comment = await commentModel.findOne({ _id: id })
        return Response.json({ comment }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}


export async function PUT(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params

        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })


        const reqBody = await req.json()
        const { content } = reqBody

        await commentModel.findOneAndUpdate({ _id: id },

            {
                $set: { body: content }
            }
        )

        return Response.json({ message: "Comment was Updated Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}


export async function DELETE(req, { params }) {
    try {
        connectToDB()
        const user = await authAdmin()
        if (!user) throw new Error("This api Protected")

        const { id } = await params
       
        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        await commentModel.findOneAndDelete({ _id: id })

        return Response.json({ message: "Comment Removed Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}


