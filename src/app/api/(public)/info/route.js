import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import infoService from "@/services/public/info";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const data = await infoService.getInfo();

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}