import connectToDB from "../../../../configs/db";
import FavoriteModel from "../../../../model/favorite";
import ProductModel from "../../../../model/product";
import { isValidObjectId } from "mongoose";
import { getMe } from "@/utils/serverHelper";
import { paginate } from "@/utils/helper";
import { NextResponse } from "next/server";
export async function GET(req) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) throw new Error("This API Protected");

    const { searchParams } = new URL(req.url);
    const useCursor = searchParams.has("cursor");

    const wishlist = await FavoriteModel.findOne({ user: user._id }).lean();
    if (!wishlist) {
      return NextResponse.json(
        { data: [], nextCursor: null, limit: 0 },
        { status: 200 }
      );
    }

    const result = await paginate(
      ProductModel,                 
      searchParams,
      { _id: { $in: wishlist.products } }, 
      null,
      useCursor,
      true
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.log(err);
    
    return NextResponse.json(
      { message: err.message || "Unknown Error" },
      { status: 500 }
    );
  }
}
export async function POST(req) {
    try {
        await connectToDB();
        const user = await getMe();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { productID } = body;

        if (!isValidObjectId(productID)) return NextResponse.json({ message: "Invalid Product ID" }, { status: 422 });

        const product = await ProductModel.findById(productID);
        if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        const exists = await FavoriteModel.findOne({ user: user._id, products: productID });
        if (exists) return NextResponse.json({ message: "Product already in wishlist" }, { status: 409 });

        await FavoriteModel.findOneAndUpdate(
            { user: user._id },
            { $push: { products: productID } },
            { upsert: true }
        );

        return NextResponse.json({ message: "Product added to wishlist" }, { status: 200 });
    } catch (err) {      
        return NextResponse.json({ message:err.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await connectToDB();
        const user = await getMe();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const productID = searchParams.get("productID");

        if (!isValidObjectId(productID)) return NextResponse.json({ message: "Invalid Product ID" }, { status: 422 });

        await FavoriteModel.findOneAndUpdate(
            { user: user._id },
            { $pull: { products: productID } }
        );

        return NextResponse.json({ message: "Product removed from wishlist" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message:err.message }, { status: 500 });
    }
}
