import { NextResponse } from "next/server";
import { revokeSession } from "@/services/api/shared/session";
import { verifyRefreshToken } from "@/utils/api/auth";
export async function POST(req) {
    try {
        let sid = req.sessionId || null;

        const refreshToken = req.cookies.get("refreshToken")?.value;
        if (!sid && refreshToken) {
            const payload = await verifyRefreshToken(refreshToken);
            sid = payload?.sid || null;
        }

        if (sid) {
            await revokeSession(sid, "logout");
        }

        const response = NextResponse.json(
            {
                success: true,
                message: "Logged out",
            },
            { status: 200 }
        );

        response.cookies.set("accessToken", "", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0,
        });

        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (err) {
        console.error("Logout error:", err);

        return NextResponse.json(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}