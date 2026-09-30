import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import infoService from "@/services/admin/info";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { infoSchema } from "@/validators/info";

export async function POST(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = validate(infoSchema, body);

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult = await infoService.createInfo(
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
                message: "Info created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PUT(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = validate(infoSchema, body);

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult = await infoService.updateInfo(
            result.data
        );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json({
            message: "Info updated successfully",
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const result = await infoService.deleteInfo();

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json({
            message: "Info deleted successfully",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}