import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import DepartmentModel from "../../../../../model/department";
import { createDepartmentSchema } from "../../../../../validators/department";
import { authAdmin } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

const CASE_INSENSITIVE = { locale: "en", strength: 2 };

/* GET /api/admin/departments
   All departments, including inactive ones */
export async function GET() {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const departments = await DepartmentModel.find().sort({ order: 1, title: 1 });

    return NextResponse.json({ departments }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/departments");
  }
}

/* POST /api/admin/departments
   Body: { title, description?, isActive?, order? } */
export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createDepartmentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const exists = await DepartmentModel.exists({ title: parsed.data.title }).collation(
      CASE_INSENSITIVE
    );
    if (exists) return jsonError("Department already exists", 409);

    const department = await DepartmentModel.create(parsed.data);

    return NextResponse.json(
      { message: "Department created successfully", data: department },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === 11000) return jsonError("Department already exists", 409);
    return handleRouteError(err, "POST /api/admin/departments");
  }
}