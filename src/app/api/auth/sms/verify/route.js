import connectToDB from "../../../../../../configs/db"
import otpMOdel from "../../../../../../model/otp"
import { generateToken, generateRefreshToken } from "@/utils/auth"
import UserModel from "../../../../../../model/user"
import { z } from "zod"

const schema = z.object({
  phone: z
    .string()
    .length(11)
    .regex(/^09\d{9}$/),
  code: z.string().min(4),
})

export async function POST(req) {
  try {
    await connectToDB()

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success)
      return Response.json({ message: "Invalid data" }, { status: 422 })

    const { phone, code } = parsed.data
    const now = Date.now()

    const otp = await otpMOdel.findOne({ phone, code })
    if (!otp)
      return Response.json({ message: "Code is not correct" }, { status: 422 })

    if (otp.expTime < now)
      return Response.json({ message: "Code is expired" }, { status: 410 })

    let user = await UserModel.findOne({ phone })
    if (!user) {
      const count = await UserModel.countDocuments()
      user = await UserModel.create({
        phone,
        role: count < 3 ? "ADMIN" : "USER",
      })
    }

    const email = user.email || `${phone}@gmail.com`

    // Generate tokens
    const accessToken = await generateToken({ email })
    const refreshToken = await generateRefreshToken({ email })

    // Save refresh token in DB
    await UserModel.findByIdAndUpdate(user._id, { refreshToken })

    // Set cookies
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax`

    return Response.json(
      { message: "Logged in successfully" },
      {
        status: 200,
        headers: {
          "Set-Cookie": [
            `token=${accessToken}; ${cookieOptions}`,
            `refreshToken=${refreshToken}; ${cookieOptions}`,
          ],
        },
      }
    )
  } catch (err) {
    console.log(err)
    return Response.json({ message: "Server error" }, { status: 500 })
  }
}
