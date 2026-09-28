import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import CommentModel from "../../../../../model/comment";
import { myCommentsQuerySchema } from "../../../../../validators/comment";
import { getMe } from "@/utils/api/authGaurd";
import { paginate } from "@/utils/paginate";
import { jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/comment/me?cursor=...&limit=... (logged-in user) */
export async function GET(req) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in", 401);

    const { searchParams } = new URL(req.url);
    const { limit, cursor } = myCommentsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const result = await paginate(CommentModel, {
      limit,
      cursor: cursor ?? null,
      filters: { user: user._id, deletedAt: null },
      sort: { _id: -1 },
    });

    const data = await CommentModel.populate(result.data || [], {
      path: "productId",
      select: "name img",
    });

    return NextResponse.json({ data, pagination: result.pagination }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/comment/me");
  }
}