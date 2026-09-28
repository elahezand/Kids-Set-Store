import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGaurd";

import orderService from "@/services/orderService";

import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function POST(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const result =
            await orderService.runAutoComplete();

        return NextResponse.json({
            message: "Auto complete executed successfully",
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}