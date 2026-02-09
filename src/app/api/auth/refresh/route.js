import connectToDB from '../../../../../configs/db'
import UserModel from '../../../../../model/user'
import { verifyRefreshToken, generateToken } from '@/utils/auth'
import { cookies } from 'next/headers'

export async function POST(req) {
    try {
       await connectToDB()
        const cookiSrore = await cookies()

        const refreshtoken = cookiSrore.get("refreshToken").value

        if (!refreshtoken) return Response.json({ message: "User unauthorized" }, { status: 401 })

        const user = await UserModel.findOne({ refreshToken: refreshtoken })

        if (!user) return Response.json({ message: "User unauthorized" }, { status: 401 })

        const payloadToken = await verifyRefreshToken(refreshtoken)

        const newAccessToken = await generateToken({ email: payloadToken.email })

        return new Response({ message: newAccessToken },
            {
                status: 200,
                headers: {
                    "Set-Cookie": `token=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax`,
                }
            }
        )



    } catch (err) {
        
        return Response.json({ message: err.message }, { status: 500 })

    }
}
