import UserModal from "../../../../../model/user"
import connectToDB from "../../../../../configs/db"
import { generateToken, hashPassword, generateRefreshToken } from "@/utils/auth"
import { userValidationSchema } from "../../../../../validators/user"

export async function POST(req) {
    try {
        await connectToDB()
        const body = await req.json()

        const parsed = userValidationSchema.safeParse(body)
        if (!parsed.success) {
            return Response.json({ message: "Invalid data", errors: parsed.error.issues }, { status: 422 })
        }

        const { username, email, password, phone } = parsed.data

        const isUserExist = await UserModal.findOne({
            $or: [{ phone }, { email: email || "NULL_EMAIL" }, { username }]
        })

        if (isUserExist) {
            return Response.json({ message: "User already exists with this info" }, { status: 409 })
        }

        const hashedPassword = await hashPassword(password)

        const usersCount = await UserModal.countDocuments()
        const role = usersCount < 3 ? "ADMIN" : "USER"

        const newUser = await UserModal.create({
            username,
            email: email || null,
            phone,
            password: hashedPassword,
            role
        })

        const payload = { email: newUser.email, id: newUser._id };
        const accessToken = await generateToken(payload)
        const refreshToken = await generateRefreshToken(payload)

        const response = Response.json(
            { message: "Registered successfully." },
            { status: 201 }
        );

        response.headers.append("Set-Cookie", `token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
        response.headers.append("Set-Cookie", `refreshToken=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);

        return response;

    } catch (err) {
        console.error("Register Error:", err)
        return Response.json({ message: "Server Error" }, { status: 500 })
    }
}