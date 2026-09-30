import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import articleService from "@/services/public/article";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = await articleService.getPublicArticles(query);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}