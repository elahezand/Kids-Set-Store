import { NextResponse } from "next/server";
import User from "@/model/user";
import { compare } from "bcryptjs";
import redisClient from "@/configs/redis";
import connectToDB from "@/configs/db";
import sessionService from "@/services/shared/session";
import authCookies from "@/utils/auth/cookies";

const OTP_TTL_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

const getOtpKey = (phone) => `otp:${phone}`;
const getOtpAttemptsKey = (phone) =>
    `otp:attempts:${phone}`;

export async function POST(req) {
    try {
        await connectToDB();

        const { phone, code } = await req.json();

        if (!phone || !code) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Phone and code are required",
                },
                { status: 400 }
            );
        }

        const savedOtp = await redisClient.get(
            getOtpKey(phone)
        );

        if (!savedOtp) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OTP expired",
                },
                { status: 410 }
            );
        }

        const attempts = await redisClient.incr(
            getOtpAttemptsKey(phone)
        );

        if (attempts === 1) {
            await redisClient.expire(
                getOtpAttemptsKey(phone),
                OTP_TTL_SECONDS
            );
        }

        if (attempts > MAX_OTP_ATTEMPTS) {
            await redisClient.del(getOtpKey(phone));

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Too many wrong codes. Request a new code.",
                },
                { status: 429 }
            );
        }

        const isValid = await compare(
            String(code),
            savedOtp
        );

        if (!isValid) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid OTP",
                },
                { status: 400 }
            );
        }

        const deleted = await redisClient.del(
            getOtpKey(phone)
        );

        await redisClient.del(
            getOtpAttemptsKey(phone)
        );

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message: "OTP expired",
                },
                { status: 410 }
            );
        }

        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({
                phone,
                username: "SETKID-USER",
                role: ["USER"],
            });
        }

        const {
            accessToken,
            refreshToken,
        } = await sessionService.createSession(
            user,
            req
        );

        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                data: {
                    user: user.toObject(),
                },
            },
            { status: 200 }
        );

        authCookies.setAuthCookies(response, {
            accessToken,
            refreshToken,
        });

        return response;

    } catch (err) {
        console.error(
            "OTP verification error:",
            err
        );

        return NextResponse.json(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}