import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import notificationService from "@/services/admin/notification";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { createNotificationSchema } from "@/validators/notification";

export async function POST(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = validate(
            createNotificationSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await notificationService.create(result.data);

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json(
            {
                message: "Notification created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}