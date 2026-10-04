import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import userService from "@/services/server/admin/user";
import validate from "@/utils/validate";
import { adminUsersQuerySchema, createUserSchema } from "@/validators/user";
import { handleRouteError, jsonError, respond, validationError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const { searchParams } = new URL(request.url);
        const query = validate(adminUsersQuerySchema, Object.fromEntries(searchParams.entries()));

        if (!query.success) return validationError(query.errors);

        const result = await userService.getAllUsers(query.data);

        return respond({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}


export async function POST(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const body = await request.json();
        const result = validate(createUserSchema, body);

        if (!result.success) return validationError(result.errors);

        const serviceResult = await userService.postNewUser(result.data);

        if (!serviceResult.success) {
            return jsonError(serviceResult.message, serviceResult.status);
        }

        return respond(
            {
                success: true,
                message: "User created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}