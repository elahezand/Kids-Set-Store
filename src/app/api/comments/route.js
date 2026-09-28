import { NextResponse } from "next/server";
import connectToDB from "../../../../configs/db";
import CommentModel from "../../../../model/comment";
import ProductModel from "../../../../model/product";
import {
  createCommentSchema,
  commentListQuerySchema,
} from "../../../../validators/comment";
import { getMe } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/comment?productId=...&cursor=...&limit=... (public)
   Approved reviews of a product, each with its approved replies */
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const parsed = commentListQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!parsed.success) return validationError(parsed.error);

    const { productId, limit, cursor } = parsed.data;

    const result = await paginate(CommentModel, {
      limit,
      cursor: cursor ?? null,
      filters: { productId, parentId: null, status: "approved", deletedAt: null },
      sort: { _id: -1 },
    });

    const reviews = await CommentModel.populate(result.data || [], {
      path: "user",
      select: "name username",
    });

    const data = await CommentModel.attachReplies(reviews);

    return NextResponse.json({ data, pagination: result.pagination }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/comment");
  }
}

/* POST /api/comment (logged-in user)
   Body: { productId, rating, body, pros?, cons?, recommendation? } */
export async function POST(req) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in to write a review", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { productId, ...fields } = parsed.data;

    if (!(await ProductModel.exists({ _id: productId }))) {
      return jsonError("Product not found", 404);
    }

    const alreadyReviewed = await CommentModel.exists({
      user: user._id,
      productId,
      parentId: null,
      deletedAt: null,
    });
    if (alreadyReviewed) return jsonError("You have already reviewed this product", 409);

    // Always a pending review: status, parentId and moderation can't come from the user
    const comment = await CommentModel.create({
      ...fields,
      productId,
      user: user._id,
      parentId: null,
    });

    return NextResponse.json(
      { message: "Your review was sent and will be shown after approval", data: comment },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === 11000) return jsonError("You have already reviewed this product", 409);
    return handleRouteError(err, "POST /api/comment");
  }
}