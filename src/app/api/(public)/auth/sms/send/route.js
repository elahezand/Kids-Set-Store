import { respond } from "@/utils/apiResponse";
import connectToDB from "@/configs/db";
import Ban from "@/model/ban";
import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import redisClient from "@/configs/redis";

const OTP_TTL_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

const getOtpKey = (phone) => `otp:${phone}`;

const getOtpAttemptsKey = (phone) =>
    `otp:attempts:${phone}`;

const formatRemainingTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        seconds
    ).padStart(2, "0")}`;
};

const getOtpDetails = async (phone) => {
    const ttl = await redisClient.ttl(
        getOtpKey(phone)
    );

    if (ttl <= 0) {
        return {
            expired: true,
            remainingTime: "00:00",
        };
    }

    return {
        expired: false,
        remainingTime: formatRemainingTime(ttl),
    };
};

export async function POST(req) {
    try {
        await connectToDB();

        const { phone } = await req.json();

        if (!phone || typeof phone !== "string") {
            return respond(
                {
                    success: false,
                    message: "Phone is required",
                },
                { status: 400 }
            );
        }

        const isBanned = await Ban.findOne({ phone });

        if (isBanned) {
            return respond(
                {
                    success: false,
                    message: "User Is Banned",
                },
                { status: 403 }
            );
        }

        const {
            expired,
            remainingTime,
        } = await getOtpDetails(phone);

        if (!expired) {
            return respond(
                {
                    success: false,
                    message: `Try again after ${remainingTime}`,
                    data: {
                        remainingTime,
                    },
                },
                { status: 429 }
            );
        }

        const attemptsKey =
            getOtpAttemptsKey(phone);

        const attempts = Number(
            (await redisClient.get(attemptsKey)) || 0
        );

        if (attempts >= MAX_OTP_ATTEMPTS) {
            return respond(
                {
                    success: false,
                    message:
                        "Too many attempts. Try again later.",
                },
                { status: 429 }
            );
        }

        const code = crypto.randomInt(
            10000,
            100000
        );

        if (process.env.NODE_ENV !== "production") {
            console.log("[DEV OTP]", code);
        }

        try {
            await axios.post(
                "https://ippanel.com/api/select",
                {
                    op: "pattern",
                    user: process.env.SMS_USER,
                    pass: process.env.SMS_PASS,
                    fromNum: "3000505",
                    toNum: phone,
                    patternCode:
                        process.env.SMS_PATTERN,
                    inputData: [
                        {
                            "verification-code": code,
                        },
                    ],
                },
                {
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                }
            );
        } catch (err) {
            console.error(
                "SMS service error:",
                err.message
            );

            return respond(
                {
                    success: false,
                    message: "SMS service failed",
                },
                { status: 500 }
            );
        }

        const hashedOtp = await bcrypt.hash(
            String(code),
            10
        );

        await redisClient.set(
            getOtpKey(phone),
            hashedOtp,
            {
                EX: OTP_TTL_SECONDS,
            }
        );

        await redisClient.del(attemptsKey);

        return respond(
            {
                success: true,
                message: "OTP sent successfully",
                data: {
                    remainingTime:
                        formatRemainingTime(
                            OTP_TTL_SECONDS
                        ),
                },
            },
            { status: 200 }
        );

    } catch (err) {
        console.error("OTP error:", err);

        return respond(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}