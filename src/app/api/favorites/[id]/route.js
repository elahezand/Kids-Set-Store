import connectToDB from "../../../../../configs/db";
import FavoriteModel from "../../../../../model/favorite";
import { isValidObjectId } from "mongoose";
import { authUser } from "@/utils/serverHelper";
import { NextResponse } from "next/server";

export async function DELETE(req,{params}) {
    try {
        await connectToDB();
        const user = await authUser();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params

        if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid Product ID" }, { status: 422 });

        await FavoriteModel.findOneAndUpdate(
            { user: user._id },
            { $pull: { products: id } }
        );

        return NextResponse.json({ message: "Product removed from wishlist" }, { status: 200 });
    } catch (err) {
        console.log(err);
        
        return NextResponse.json({ message:err.message }, { status: 500 });
    }
}
