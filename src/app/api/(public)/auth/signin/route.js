import UserModel from "@/model/user";
import connectToDB from "@/configs/db";
import { verifyPassword } from "@/utils/auth";
import { createSession } from "@/services/shared/session";
import { NextResponse } from "next/server";
import authSchema from "@/validators/auth";
import validate from "@/utils/validate";
import authCookies from "@/utils/auth/cookies";

export async function POST(req) {
    try {
        await connectToDB();

        const body = await req.json();

        const result = validate(authSchema, body);

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid data",
                    errors: result.errors,
                },
                { status: 422 }
            );
        }

        const {
            identifier,
            password,
            remember,
        } = result.data;

        const user = await UserModel.findOne({
            $or: [
                { phone: identifier },
                { email: identifier },
                { username: identifier },
            ],
        }).select("+password");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // accounts created with OTP have no password yet
        if (!user.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This account has no password. Log in with a one-time code.",
                },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(
            password,
            user.password
        );

        if (!isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid password",
                },
                { status: 401 }
            );
        }

        const {
            accessToken,
            refreshToken,
        } = await createSession(user, req);

        const response = NextResponse.json(
            {
                success: true,
                message: "Logged in successfully",
                data: {
                    user: user.toObject(),
                },
            },
            { status: 200 }
        );

        // Access token
        response.cookies.set(
            "accessToken",
            accessToken,
            {
                ...authCookies.cookieOptions,
                maxAge: 60 * 60 * 24,
            }
        );

        // Refresh token
        response.cookies.set(
            "refreshToken",
            refreshToken,
            {
                ...authCookies.cookieOptions,
                maxAge: remember
                    ? 60 * 60 * 24 * 30
                    : 60 * 60 * 24 * 7,
            }
        );

        return response;

    } catch (err) {
        console.error("Login Error:", err);

        return NextResponse.json(
            {
                success: false,
                message: "Server error",
            },
            { status: 500 }
        );
    }
}