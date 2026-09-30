import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import categoryService from "@/services/public/category";
import { handleRouteError } from "@/utils/apiResponse";

export async function GET() {
    try {
        await connectToDB();

        const data = await categoryService.getAllCategories();

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}