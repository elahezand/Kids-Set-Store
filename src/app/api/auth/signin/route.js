import UserModel from "../../../../../model/user"
import connectToDB from "../../../../../configs/db"
import {
  generateRefreshToken,
  generateToken,
  verifyPassword,
} from "@/utils/auth"
import { z } from "zod"

const schema = z.object({
  identifier: z.string(),
  password: z.string().min(6),
  remember: z.boolean().optional(),
})

export async function POST(req) {
  try {
    await connectToDB()

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success)
      return Response.json({ message: "Invalid data" }, { status: 422 })

    const { identifier, password, remember } = parsed.data

    const user = await UserModel.findOne({
      $or: [{ phone: identifier }, { email: identifier }],
    })    
    if (!user)
      return Response.json({ message: "User not found" }, { status: 404 })

    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid)
      return Response.json({ message: "Invalid password" }, { status: 401 })

    const email = user.email || `${user.phone}@gmail.com`

    const accessToken = await generateToken({ email })
    const refreshToken = await generateRefreshToken({ email })

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { refreshToken },
    })

    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }${remember ? "; Max-Age=2592000" : ""}` 

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
    return Response.json({ message: "Server error" }, { status: 500 })
  }
}
