import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";

import orderService from "@/services/admin/order";

import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError("Unauthorized", 401);
        }

        const data =
            await orderService.getStuckOrders();

        return NextResponse.json({
            data: data.data,
            pagination: data.pagination,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}