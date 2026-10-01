import { respond } from "@/utils/apiResponse";

export async function GET(req) {
    try {
        const user = await req.user;
        return respond(
            {
                success: true,
                data: {
                    user: user.toObject(),
                },
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("Get Me Error:", err);

        return respond(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}