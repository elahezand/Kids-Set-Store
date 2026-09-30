import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import userService from "@/services/admin/user";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return jsonError("Unauthorized", 401);

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = await userService.getAllUsers(query);

        return NextResponse.json({
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
        if (!admin) return jsonError("Unauthorized", 401);

        const body = await request.json();
        const result = validate(createUserSchema, body);

        if (!result.success) return validationError(result.errors);

        const serviceResult = await userService.postNewUser(result.data);

        if (!serviceResult.success) {
            return jsonError(serviceResult.message, serviceResult.status);
        }

        return NextResponse.json(
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