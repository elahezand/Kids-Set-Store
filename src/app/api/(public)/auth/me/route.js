import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const user = await req.user;
        return NextResponse.json(
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

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}