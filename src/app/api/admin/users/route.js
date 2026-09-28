import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGaurd";
import validate from "@/utils/validate";
import userService from "@/services/userService";
import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";
import { adminUsersQuerySchema } from "@/validators/user";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const query = Object.fromEntries(searchParams.entries());

        const result = validate(adminUsersQuerySchema, query);

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult = await userService.getAllUsers(result.data);

        return NextResponse.json({
            data: serviceResult.data,
            pagination: serviceResult.pagination,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}