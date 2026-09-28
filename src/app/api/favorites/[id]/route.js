import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../configs/db";
import FavoriteModel from "../../../../../model/favorite";
import { getMe } from "@/utils/api/authGaurd";
import { jsonError, handleRouteError } from "@/utils/apiHelpers";

/* DELETE /api/favorite/:productId (logged-in user) */
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in", 401);

    const { productId } = await params;
    if (!isValidObjectId(productId)) return jsonError("Product not found", 404);

    const wishlist = await FavoriteModel.findOneAndUpdate(
      { user: user._id },
      { $pull: { products: productId } },
      { new: true }
    )
      .select("products")
      .lean();

    return NextResponse.json(
      { message: "Removed from your wishlist", count: wishlist?.products?.length ?? 0 },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "DELETE /api/favorite/:productId");
  }
}