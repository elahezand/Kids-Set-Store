import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import ContactModel from "../../../../../model/contact";
import { adminContactsQuerySchema } from "../../../../../validators/contact";
import { authAdmin } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import { jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/admin/contacts?status=new&cursor=...&limit=... */
export async function GET(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const { searchParams } = new URL(req.url);
    const { status, limit, cursor } = adminContactsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const [result, unreadCount] = await Promise.all([
      paginate(ContactModel, {
        limit,
        cursor: cursor ?? null,
        filters: status ? { status } : {},
        sort: { _id: -1 },
      }),
      ContactModel.countDocuments({ status: "new" }),
    ]);

    const data = await ContactModel.populate(result.data || [], [
      { path: "user", select: "name username" },
      { path: "handledBy", select: "name username" },
    ]);

    return NextResponse.json(
      { data, pagination: result.pagination, unreadCount },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/contacts");
  }
}