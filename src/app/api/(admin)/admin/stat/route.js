import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import statsService from "@/services/public/stats";

import {
    handleRouteError,
    jsonError,
    validationError,
} from "@/utils/apiResponse";

import { statsTimeseriesSchema } from "@/validators/stats";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const days = searchParams.get("days");

        if (days !== null) {
            const result = validate(
                statsTimeseriesSchema,
                { days }
            );

            if (!result.success) {
                return validationError(result.errors);
            }

            const serviceResult =
                await statsService.getAdminStatsTimeseries(
                    result.data.days
                );

            return NextResponse.json({
                data: serviceResult.data,
            });
        }

        const serviceResult =
            await statsService.getAdminStats();

        return NextResponse.json({
            data: serviceResult.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}