import { authAdmin } from "@/utils/serverHelper"
import connectToDB from "../../../../../configs/db"
import commentModel from "../../../../../model/comment"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json()
        const { answer, commentID } = body

        const updated = await commentModel.findByIdAndUpdate(commentID,
            {
                $push: {
                    answer: {
                        text: answer,
                        admin: admin._id,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        )

        if (!updated) {
            return NextResponse.json({ message: "Comment not found" }, { status: 404 })
        }

        return NextResponse.json(
            { message: "Answer added successfully" },
            { status: 200 }
        )
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}