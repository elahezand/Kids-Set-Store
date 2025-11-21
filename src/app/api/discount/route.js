import connectToDB from "../../../../db/db";
import DiscountModel from "../../../../model/discount";
import { authAdmin } from "@/utils/serverHelper";

export async function GET() {
    try {
        connectToDB()
        const disCounts = await DiscountModel.find({})
        return Response.json({ disCounts }, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })
    }
}

export async function POST(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json()

        const {
            code,
            maxUses,
            productID,
            percent,
            expTime, } = body


        if (!code.trim()) return Response.json({ massage: "Not Valid :)" }, { status: 422 })


        await DiscountModel.create({
            code,
            maxUses,
            expTime,
            productID,
            percent,
            expTime,
            uses: 1
        })


        return Response.json({ massage: "Discount Created Successfully :)" }, { satatus: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { satatus: 500 })
    }
}

