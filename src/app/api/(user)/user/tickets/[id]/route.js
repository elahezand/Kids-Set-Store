import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import ticketService from "@/services/shared/ticket";
import { authUser } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import {
    handleRouteError,
    jsonError,
} from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user) {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Not Valid :)", 422);
        }

        const result = await ticketService.getTicketById(id);

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json(result.data, {
            status: 200,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}