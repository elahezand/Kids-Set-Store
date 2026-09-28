import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../configs/db";
import CategoryModel from "../../../../model/category";
import { jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/category */
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);

    if (searchParams.get("tree") === "true") {
      const categories = await CategoryModel.getTree();
      return NextResponse.json({ categories }, { status: 200 });
    }

    const parentParam = searchParams.get("parentId");
    const isRootQuery = parentParam === "null" || parentParam === "";

    if (parentParam !== null && !isRootQuery && !isValidObjectId(parentParam)) {
      return jsonError("Invalid parentId", 400);
    }

    const filter =
      parentParam === null ? {} : { parentId: isRootQuery ? null : parentParam };

    const categories = await CategoryModel.find(filter).sort({ name: 1 });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/category");
  }
}