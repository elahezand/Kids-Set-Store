import connectToDB from "../../configs/db";
import { cookies } from "next/headers";
import UserModel from "../../model/user";
import { verifyToken, verifyRefreshToken } from "./auth";
const authUser = async () => {
    await connectToDB()
    let user = null

    const cookiesStore = await cookies()
    const token = cookiesStore.get("token")

    if (!token) return null

    const payloadToken = await verifyToken(token.value)
    if (!payloadToken) return { status: "expired" }

    user = await UserModel.findOne({ email: payloadToken.email })
    if (!user) return null

    return user
}

const authAdmin = async () => {
    await connectToDB()
    let user = null

    const cookiesStore = await cookies()
    const token = cookiesStore.get("token")
    if (!token) return null

    const payloadToken = await verifyToken(token.value)
    if (!payloadToken) return { status: "expired" }

    user = await UserModel.findOne({ email: payloadToken.email })

    if (!user) return null
    if (user.role !== "ADMIN") return user

    return user
}

const getMe = async () => {
    await connectToDB()
    const cookiesStore = await cookies()
    const token = cookiesStore.get("refreshToken")
    if (!token) return null

    const payloadToken = await verifyRefreshToken(token.value)

    if (!payloadToken) return null

    const user = await UserModel.findOne({ email: payloadToken.email })
    return user

}
export {
    authUser,
    authAdmin,
    getMe
}