import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import productService from "@/services/public/product";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const result = await productService.getAllProducts(query);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}