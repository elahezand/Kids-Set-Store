
import UserModal from "../../../../../model/user"
import connectToDB from "../../../../../db/db"
import { generateToken, hashPassword } from "@/utils/auth"
import { validateEmail, validatePhone, validateUserNane, validatePassword } from "../../../../../validator/user"
export async function POST(req) {
    connectToDB()
    try {
        const users = UserModal.find({})
        const reqBody = await req.json()

        const { username, email, password, phone } = reqBody

        const isEmailValid = validateEmail(email)
        const isPasswordValid = validatePassword(password)
        const isPhoneValid = validatePhone(phone)
        const isUsernameValid = validateUserNane(username)

        if (email) {
            if (!isEmailValid) {
                return Response.json({ message: "email Not Valid :)" }, { status: 422 })
            }
        }
        if (!isPhoneValid) return Response.json({ message: "phone Not Valid :)" }, { status: 422 })

        if (!isUsernameValid) return Response.json({ message: "username Not Valid :)" }, { status: 422 })

        if (!isPasswordValid) return Response.json({ message: "Password Not Valid :)" }, { status: 422 })



        const isUserExist = await UserModal.findOne({ $or: [{ phone }, { email }, { username }] })

        if (isUserExist) return Response.json({ message: "This username or email or Phone has already existed :)" }, { status: 409 })


        const hashedPassword = await hashPassword(password)

        const accessToken = await generateToken({ username })
        const refreshToken = await generateRefreshToken({ email })


        await UserModal.create({
            username,
            email: email ? email : null,
            password: hashedPassword,
            phone,
            role: 0 < users.length < 3 ? "ADMIN" : "USER"
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






