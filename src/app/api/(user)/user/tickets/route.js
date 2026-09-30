import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import ticketService from "@/services/user/ticket";
import { authUser } from "@/utils/auth/authGuard";
import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function GET(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const query = Object.fromEntries(
            searchParams.entries()
        );

        const result = await ticketService.getMyTickets(
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