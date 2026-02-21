import connectToDB from "../../../../../configs/db";
import discountModel from "../../../../model/discount";
import { NextResponse } from "next/server";
import { discountValidationSchema } from "../../../../validators/discount";
import { authAdmin } from "@/utils/serverHelper";
import ProductModel from "../../../../../model/product";

export async function POST(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const body = await req.json();
        const parsed = discountValidationSchema.safeParse(body);

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

        const products = await ProductModel.find({ name: "discount" });

        for (let product of products) {
            product.discount = newOff.percent;
            product.price = product.price * (1 - newOff.percent / 100);
            await product.save();
        }
        return NextResponse.json({ massage: "Discount Created Successfully :)", newOff }, { satatus: 200 })
    }
    catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { satatus: 500 })
    }
}