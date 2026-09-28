import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../../configs/db";
import DepartmentModel from "../../../../../../model/department";
import TicketModel from "../../../../../../model/ticket";
import { updateDepartmentSchema } from "../../../../../../validators/department";
import { authAdmin } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

const CASE_INSENSITIVE = { locale: "en", strength: 2 };

// Every handler here: admin + valid id
const guard = async (params) => {
  const admin = await authAdmin();
  if (!admin) return { error: jsonError("Admin access required", 401) };

  const { id } = await params;
  if (!isValidObjectId(id)) return { error: jsonError("Department not found", 404) };

  return { admin, id };
};

/* PUT /api/admin/departments/:id*/
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateDepartmentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    if (parsed.data.title !== undefined) {
      const titleTaken = await DepartmentModel.exists({
        _id: { $ne: id },
        title: parsed.data.title,
      }).collation(CASE_INSENSITIVE);

      if (titleTaken) return jsonError("Department already exists", 409);
    }

    const department = await DepartmentModel.findByIdAndUpdate(id, parsed.data, {
      new: true,
    });

    if (!department) return jsonError("Department not found", 404);

    return NextResponse.json(
      { message: "Department updated successfully", data: department },
      { status: 200 }
    );
  } catch (err) {
    if (err?.code === 11000) return jsonError("Department already exists", 409);
    return handleRouteError(err, "PUT /api/admin/departments/:id");
  }
}

/* DELETE /api/admin/departments/:id*/
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const ticketsCount = await TicketModel.countDocuments({ department: id });

    if (ticketsCount > 0) {
      return jsonError(
        `${ticketsCount} tickets use this department. Deactivate it instead of deleting.`,
        409
      );
    }

    const department = await DepartmentModel.findByIdAndDelete(id);
    if (!department) return jsonError("Department not found", 404);

    return NextResponse.json({ message: "Department removed successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/departments/:id");
  }
}