import connectToDB from "../../../../../db/db";
import discountModel from "../../../../../model/discount";
import { NextResponse } from "next/server";
import { authUser } from "@/utils/serverHelper";

export async function POST(req) {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const code = String(body.code || "").trim().toUpperCase();

        const off = await discountModel
            .findOneAndUpdate(
                {
                    code,
                    $expr: { $lt: ["$uses", "$max"] },
                    usedBy: { $ne: user._id },
                },
                {
                    $inc: { uses: 1 },
                    $push: { usedBy: user._id },
                },
                { new: true }
            )
            .populate("product");

        if (!off) {
            return NextResponse.json(
                { message: "Invalid, expired, or already used discount code" },
                { status: 400 }
            );
        }

        const price = off.product.price;
        const discountedPrice = price * (1 - off.percent / 100);

        return NextResponse.json(
            {
                message: "Discount applied successfully",
                discountedPrice,
                percent: off.percent,
                productId: off.product._id.toString()

            },
            { status: 200 }
        );
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
