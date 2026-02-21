import { authAdmin } from "@/utils/serverHelper"
import connectToDB from "../../../../../db/db"
import discountModel from "../../../../../model/discount";
import { updateOffSchema } from "../../../../validators/discount";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        await connectToDB()
        const { id } = await params

        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json();
        const parsed = updateOffSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        const updatedOff = await discountModel.findByIdAndUpdate(
            id,
            parsed.data,
            { new: true }
        );
        if (!updatedOff) return NextResponse.json({ message: "NOT founی" }, { status: 404 })
        return NextResponse.json({ updatedOff }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
export async function DELETE(req, { params }) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params

        await discountModel.findOneAndDelete({ _id: id })
        return NextResponse.json({ message: "discount Removed Successfully" }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { status: 500 })
    }
}




