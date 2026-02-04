import { authAdmin } from "@/utils/serverHelper"
import connectToDB from "../../../../../../configs/db"
import commentModel from "../../../../../../model/comment"
import { isValidObjectId } from "mongoose"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params;
        if (!isValidObjectId(id)) {
            return NextResponse.json({ message: "Invalid ID" }, { status: 422 });
        }
        const comment = await commentModel.findById(id)
        if (!comment) {
            return NextResponse.json({ message: "Comment not found" }, { status: 404 });
        }

        await commentModel.findByIdAndUpdate(id,
            { isAccept: !comment.isAccept }
        )

        return NextResponse.json({ message: "Comment Status Changed Successfully" }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }

}
