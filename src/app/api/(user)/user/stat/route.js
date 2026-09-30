import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import statsService from "@/services/user/stats";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const days = searchParams.get("days") || 14;

        const data =
            await statsService.getUserStatsTimeseries(
                user._id,
                days
            );

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}