import connectToDB from "@/configs/db";
import { cookies } from "next/headers";
import UserModel from "@/model/user";
import {
    verifyToken,
    verifyRefreshToken,
} from "@/utils/auth";

const getAuthUser = async (tokenName, verify) => {
    await connectToDB();

    const cookiesStore = await cookies();
    const token = cookiesStore.get(tokenName);

    if (!token) return null;

    const payload = await verify(token.value);

    if (!payload) {
        return { status: "expired" };
    }

    const user = await UserModel.findOne({
        email: payload.email,
    });

    if (!user) return null;

    return user;
};

const authUser = async () => {
    return getAuthUser("token", verifyToken);
};

const authAdmin = async () => {
    const user = await getAuthUser(
        "token",
        verifyToken
    );

    if (!user || user.status === "expired") {
        return user;
    }

    if (user.role !== "ADMIN") {
        return null;
    }

    return user;
};

const getMe = async () => {
    const user = await getAuthUser(
        "refreshToken",
        verifyRefreshToken
    );

    if (!user || user.status === "expired") {
        return null;
    }

    return user;
};

export {
    authUser,
    authAdmin,
    getMe,
};