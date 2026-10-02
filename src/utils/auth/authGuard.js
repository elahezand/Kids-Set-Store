import connectToDB from "@/configs/db";
import { cookies } from "next/headers";
import UserModel from "@/model/user";
import Session from "@/model/session";
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

    if (!payload?.id || !payload?.sid) {
        return { status: "expired" };
    }

    const session = await Session.findById(payload.sid);

    if (!session || !session.isActive()) {
        return { status: "expired" };
    }

    if (String(session.user) !== String(payload.id)) {
        return null;
    }

    const user = await UserModel.findById(payload.id);

    if (!user) return null;

    return user;
};

const authUser = async () => {
    return getAuthUser("accessToken", verifyToken);
};

const authAdmin = async () => {
    const user = await getAuthUser(
        "accessToken",
        verifyToken
    );

    if (!user || user.status === "expired") {
        return user;
    }

    const roles = Array.isArray(user.role) ? user.role : [user.role];
    if (!roles.includes("ADMIN")) {
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