import connectToDB from "../../../../configs/db";
import discountModel from "../../../../model/discount";
import { discountCreateSchema } from "../../../../validators/discount";
import { NextResponse } from "next/server";
import { authAdmin } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";

export async function GET() {
    try {
        await connectToDB()
        const { searchParams } = new URL(req.url)
        const useCursor = searchParams.has("cursor");

        const result = await paginate(
            discountModel,
            searchParams,
            {},
            null,
            useCursor,
            true,
        )

        return NextResponse.json({ result }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { status: 500 })
    }
}
export async function POST(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json();
        const parsed = discountCreateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const newOff = await discountModel.create({
            ...parsed.data,
            creator: admin._id
        });


        return NextResponse.json({ massage: "Discount Created Successfully :)", newOff }, { status: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

