import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import favoriteService from "@/services/public/favorite";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(
            searchParams.entries()
        );

        const data =
            await favoriteService.getPopularProducts(query);

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}