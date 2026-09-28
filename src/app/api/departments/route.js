import { NextResponse } from "next/server";
import connectToDB from "../../../../configs/db";
import DepartmentModel from "../../../../model/department";
import { handleRouteError } from "@/utils/apiHelpers";

/* GET /api/department (public)*/
export async function GET() {
  try {
    await connectToDB();

    const departments = await DepartmentModel.find({ isActive: true })
      .select("title description order")
      .sort({ order: 1, title: 1 });

    return NextResponse.json({ departments }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/department");
  }
}