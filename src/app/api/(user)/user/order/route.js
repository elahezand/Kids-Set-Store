import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import orderService from "@/services/user/order";
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
        const query = Object.fromEntries(searchParams.entries());

        const result = await orderService.getMyOrders(
            user._id,
            query
        );

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json();

        const result = await orderService.checkout(
            user._id,
            body.shippingAddress,
            body.paymentMethod,
            body.idempotencyKey || null,
            body.useWallet || false
        );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status,
                result.details
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: result.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}