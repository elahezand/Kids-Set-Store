import { NextResponse } from "next/server";
import { rotateSession } from "@/services/api/shared/session";
import authCookies from "@/utils/api/cookies";

export async function POST(req) {
    try {
        const refreshToken = req.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        const result = await rotateSession(
            refreshToken,
            req
        );

        if (!result.ok) {
            const response = NextResponse.json(
                {
                    success: false,
                    message: "Session invalid",
                },
                { status: 401 }
            );

            authCookies.clearAuthCookies(response);

            return response;
        }

        const response = NextResponse.json(
            {
                success: true,
                message: "Token refreshed",
            },
            { status: 200 }
        );

        authCookies.setAuthCookies(response, result);

        return response;

    } catch (err) {
        console.error("Refresh error:", err);

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}