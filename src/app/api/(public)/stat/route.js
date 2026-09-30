import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import statsService from "@/services/public/stats";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const data = await statsService.getPublicStats();

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}