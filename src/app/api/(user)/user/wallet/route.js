import { NextResponse } from "next/server";
import connectToDB from "@/configs/db";
import walletService from "@/services/user/wallet";
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

        const result = await walletService.getMyWallet(
            user._id,
            query
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return NextResponse.json(result);
    } catch (error) {
        return handleRouteError(error);
    }
}