import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import commentService from "@/services/public/comment";
import { handleRouteError, jsonError } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const { product } = await params;

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = await commentService.getByProduct(
            product,
            query
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}