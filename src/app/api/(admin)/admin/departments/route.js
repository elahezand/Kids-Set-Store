import connectToDB from "@/configs/db";
import { createDepartmentSchema } from "@/validators/department";
import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";
import departmentService from "@/services/server/admin/department";
import { validationError, jsonError, handleRouteError, respond } from "@/utils/apiResponse";

export async function GET() {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Admin access required", 401);
    }

    const departments = await departmentService.getDepartments();

    return respond({ data: departments }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/departments");
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();

    if (!admin || admin.status === "expired") {
      return jsonError("Admin access required", 401);
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const result = validate(createDepartmentSchema, body);

    if (!result.success) {
      return validationError(result.errors);
    }

    const serviceResult = await departmentService.createDepartment(result.data);

    if (!serviceResult.success) {
      return jsonError(serviceResult.message, serviceResult.status);
    }

    return respond(
      {
        message: "Department created successfully",
        data: serviceResult.data,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/admin/departments");
  }
}
