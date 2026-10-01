import UserModel from "@/model/user";
import { respond } from "@/utils/apiResponse";
import connectToDB from "@/configs/db";
import { hashPassword } from "@/utils/auth";
import { userValidationSchema } from "@/validators/user";
import sessionService from "@/services/server/shared/session";
import validate from "@/utils/validate";
import authCookies from "@/utils/auth/cookies";

export async function POST(req) {
    try {
        await connectToDB();

        const body = await req.json();

        const result = validate(
            userValidationSchema,
            body
        );

        if (!result.success) {
            return respond(
                {
                    success: false,
                    message: "Invalid data",
                    errors: result.errors,
                },
                { status: 422 }
            );
        }

        const {
            username,
            email,
            password,
            phone,
        } = result.data;

        const isUserExist = await UserModel.findOne({
            $or: [
                { phone },
                ...(email ? [{ email }] : []),
                { username },
            ],
        });

        if (isUserExist) {
            return respond(
                {
                    success: false,
                    message: "User already exists with this info",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const usersCount =
            await UserModel.countDocuments();

        const role =
            usersCount < 3
                ? "ADMIN"
                : "USER";

        // email has a unique+sparse index: leave it out (not null) when empty
        const newUser = await UserModel.create({
            username,
            ...(email ? { email } : {}),
            phone,
            password: hashedPassword,
            role,
        });

        const {
            accessToken,
            refreshToken,
        } = await sessionService.createSession(
            newUser,
            req
        );

        const response = respond(
            {
                success: true,
                message: "Registered successfully.",
                data: {
                    user: newUser.toObject(),
                },
            },
            { status: 201 }
        );

        response.cookies.set(
            "accessToken",
            accessToken,
            {
                ...authCookies.cookieOptions,
                maxAge: 60 * 60 * 24,
            }
        );

        response.cookies.set(
            "refreshToken",
            refreshToken,
            {
                ...authCookies.cookieOptions,
                maxAge: 60 * 60 * 24 * 7,
            }
        );

        return response;

    } catch (err) {
        console.error("Register Error:", err);

        return respond(
            {
                success: false,
                message: "Server Error",
            },
            { status: 500 }
        );
    }
}