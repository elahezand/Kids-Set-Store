import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import {
    createDepartmentSchema,
} from "../../../../../validators/department";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import departmentService from "@/services/departmentService";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

/* GET /api/admin/departments
   All departments, including inactive ones */

export async function GET() {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
            );
        }

        const departments =
            await departmentService.getDepartments();

        return NextResponse.json(
            { departments },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/departments"
        );
    }
}

/* POST /api/admin/departments */

export async function POST(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
            );
        }

        const body = await req
            .json()
            .catch(() => null);

        if (!body) {
            return jsonError(
                "Invalid JSON body",
                400
            );
        }

        const result = validate(
            createDepartmentSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await departmentService.createDepartment(
                result.data
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json(
            {
                message:
                    "Department created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "POST /api/admin/departments"
        );
    }
}