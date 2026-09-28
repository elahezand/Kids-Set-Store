import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import CommentModel from "../../../../../model/comment";
import { adminCommentsQuerySchema } from "../../../../../validators/comment";
import { authAdmin } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import { jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/admin/comments?status=pending&productId=...&userId=...&cursor=...
   Moderation queue: every comment, including deleted ones */
export async function GET(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const { searchParams } = new URL(req.url);
    const { status, productId, userId, limit, cursor } = adminCommentsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const filters = {
      ...(status && { status }),
      ...(productId && { productId }),
      ...(userId && { user: userId }),
    };

    const result = await paginate(CommentModel, {
      limit,
      cursor: cursor ?? null,
      filters,
      sort: { _id: -1 },
    });

    const data = await CommentModel.populate(result.data || [], [
      { path: "user", select: "name username phone" },
      { path: "productId", select: "name img" },
      { path: "parentId", select: "body" },
      { path: "moderation.moderatedBy", select: "name username" },
    ]);

    return NextResponse.json({ data, pagination: result.pagination }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/comments");
  }
}