import { respond } from "@/utils/apiResponse";
import { revokeSession } from "@/services/server/shared/session";
import { verifyRefreshToken } from "@/utils/auth";
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

        const response = respond(
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

        return respond(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}