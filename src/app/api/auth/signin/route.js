
import UserModal from "../../../../../model/user"
import connectToDB from "../../../../../db/db"
import { generateRefreshToken, generateToken, verifyPassword } from "@/utils/auth"
import { validatePassword } from "../../../../../validator/user"
export async function POST(req) {
    connectToDB()
    try {

        const reqBody = await req.json()

        const { identifier, password } = reqBody
        const isValidPassword = validatePassword(password)

        if (!isValidPassword) {
            return Response.json({ message: "Password NOT Valid" }, { status: 422 })
        }


        const user = await UserModal.findOne({ $or: [{ phone: identifier }, { email: identifier }] })
        if (!user) {
            return Response.json({ message: "Not FOUND :)" }, { status: 404 })
        }

        const VerifiedPassword = await verifyPassword(password, user.password)

        if (!VerifiedPassword) {
            return Response.json({ message: "Password NOT Valid :)" }, { status: 422 })
        }

        let accessToken = null
        let refreshToken = null


        const { email, phone } = user
        if (email) {
            accessToken = await generateToken({ email })
            refreshToken = await generateRefreshToken({ email })

        } else {
            const email = `${phone}@gmail.com`
            accessToken = await generateToken({ email })
            refreshToken = await generateRefreshToken({ email })
        }

        await UserModal.findOneAndUpdate({ email }, {
            $set: {
                refreshToken
            }
        })

        return Response.json({ message: "you were registerd successfully." }, {
            status: 200,
            headers: {
                "Set-Cookie": [
                    `token=${accessToken}; Path=/; HttpOnly; SameSite=Lax`,
                    `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax`
                ]
            }
        })
    }
    catch (err) {
        return Response.json({ message: "Unknown Error" }, { status: 500 })
    }

}






