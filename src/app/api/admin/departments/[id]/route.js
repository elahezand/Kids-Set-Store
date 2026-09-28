import { NextResponse } from "next/server";
import connectToDB from "../../../../../../configs/db";
import {
    updateDepartmentSchema,
} from "../../../../../../validators/department";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import validateObjectId from "@/utils/api/validateObjectId";
import departmentService from "@/services/departmentService";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

// Every handler here: admin + valid id

const guard = async (params) => {
    const admin = await authAdmin();

    if (!admin) {
        return {
            error: jsonError(
                "Admin access required",
                401
            ),
        };
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
        return {
            error: jsonError(
                "Department not found",
                404
            ),
        };
    }

    return {
        admin,
        id,
    };
};

/* PUT /api/admin/departments/:id */

export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

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
            updateDepartmentSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await departmentService.updateDepartment(
                id,
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
                    "Department updated successfully",
                data: serviceResult.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "PUT /api/admin/departments/:id"
        );
    }
}

/* DELETE /api/admin/departments/:id */

export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const serviceResult =
            await departmentService.deleteDepartment(
                id
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
                    "Department removed successfully",
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "DELETE /api/admin/departments/:id"
        );
    }
}