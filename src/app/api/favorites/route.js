import { NextResponse } from "next/server";
import connectToDB from "../../../../configs/db";
import FavoriteModel from "../../../../model/favorite";
import ProductModel from "../../../../model/product";
import { addFavoriteSchema } from "../../../../validators/favorite";
import { getMe } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/favorite (logged-in user) */
export async function GET() {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in", 401);

    const wishlist = await FavoriteModel.findOne({ user: user._id })
      .populate("products", "name price img score ratingCount isAvailable")
      .lean();

    // Deleted products come back as null after populate -> drop them
    const products = (wishlist?.products || []).filter(Boolean).reverse();

    return NextResponse.json({ data: products, count: products.length }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/favorite");
  }
}

/* POST /api/favorite (logged-in user) */
export async function POST(req) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in to add favorites", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = addFavoriteSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { productId } = parsed.data;

    if (!(await ProductModel.exists({ _id: productId }))) {
      return jsonError("Product not found", 404);
    }

 
    const wishlist = await FavoriteModel.findOneAndUpdate(
      { user: user._id },
      { $addToSet: { products: productId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .select("products")
      .lean();

    return NextResponse.json(
      { message: "Added to your wishlist", count: wishlist.products.length },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/favorite");
  }
}