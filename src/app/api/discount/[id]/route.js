import { authAdmin } from "@/utils/serverHelper"
import connectToDB from "../../../../../db/db"
import DiscountModel from "../../../../../model/discount"
import { isValidObjectId } from "mongoose"


export async function PUT(req, { params }) {
    try {
        connectToDB()
        const { id } = await params

        const isDiscountExist = await DiscountModel.findOne({ code: id })

        if (!isDiscountExist) return Response.json({ message: "Not Found" }, { status: 404 })


        if (isDiscountExist.expTime < new Date()) {
            return Response.json({ message: "Code Expired" }, { status: 410 })
        }

        if (isDiscountExist.maxUses <= isDiscountExist.uses) {
            return Response.json({ message: "“Access denied. The usage limit for this code has been exhausted.” " }, { status: 410 })
        }


        const discount = await DiscountModel.findOneAndUpdate({ code: id }, {
            $inc: {
                uses: 1
            },
        },
            { new: true }
        )

        return Response.json({ discount }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}

export async function DELETE(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params

        await DiscountModel.findOneAndDelete({ _id: id })

        return Response.json({ message: "discount Removed Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}




