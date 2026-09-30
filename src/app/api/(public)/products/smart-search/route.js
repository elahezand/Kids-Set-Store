import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import productService from "@/services/public/product";
import validate from "@/utils/validate";
import {
    handleRouteError,
    validationError,
} from "@/utils/apiResponse";
import { smartSearchSchema } from "@/validators/product";

export async function POST(request) {
    try {
        await connectToDB();

        const body = await request.json();

        const result = validate(
            smartSearchSchema,
            body
        );

        if (!result.success) {
            return validationError(result.errors);
        }

        const serviceResult =
            await productService.smartSearch(result.data);

        if (!serviceResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: serviceResult.message,
                },
                { status: serviceResult.status }
            );
        }

        return NextResponse.json({
            success: true,
            data: serviceResult.data,
            reason: serviceResult.reason,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}