import connectToDB from "../../../../../db/db"
import UserModal from "../../../../../model/user"
import { verifyRefreshToken, verifyToken } from "@/utils/auth"
import { cookies } from "next/headers"
export async function GET() {
    try {
        connectToDB()

        const cookiesStore = await cookies()

        let token = cookiesStore.get("token")

        if (!token) return Response.json({ message: "Not Found" }, { status: 404 })

        let payloadToken = await verifyToken(token.value)

        if (!payloadToken) {
            token = cookiesStore.get("refreshToken")

            if (!token) return Response.json({ message: "Unauthorized" }, { status: 401 })

            payloadToken = await verifyRefreshToken(token.value);

        }
        const user = await UserModal.findOne({ email: payloadToken.email }, "-password -refreshToken -__v")

        if (!user) return Response.json({ message: "Not Found" }, { status: 404 })

        return Response.json(user, { status: 200 })
    }

    catch (err) {

        return Response.json({ message: "UnKnownError" }, { status: 500 })
    }

}

