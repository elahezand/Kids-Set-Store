import connectToDB from "@/configs/db";
import { updateSubDepartmentSchema } from "@/validators/department";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import validateObjectId from "@/utils/validateObjectId";
import departmentService from "@/services/server/admin/department";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

const guard = async (params) => {
  const admin = await authAdmin();
  if (!admin || admin.status === "expired") return { error: jsonError("Admin access required", 401) };

  const { id } = await params;
  if (!validateObjectId(id)) return { error: jsonError("Topic not found", 404) };

  return { id };
};

export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const result = validate(updateSubDepartmentSchema, body);
    if (!result.success) return validationError(result.errors);

    const serviceResult = await departmentService.updateSubDepartment(id, result.data);
    if (!serviceResult.success) return jsonError(serviceResult.message, serviceResult.status);

    return respond({ message: "Topic updated successfully", data: serviceResult.data });
  } catch (err) {
    return handleRouteError(err, "PUT /api/admin/sub-departments/:id");
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const serviceResult = await departmentService.deleteSubDepartment(id);
    if (!serviceResult.success) return jsonError(serviceResult.message, serviceResult.status);

    return respond({ message: "Topic removed successfully" });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/sub-departments/:id");
  }
}
