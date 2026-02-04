import connectToDB from "../../../../../configs/db"
import UserModal from "../../../../../model/user"
import { authAdmin } from "@/utils/serverHelper"
import { userValidationSchema } from "../../../../../validators/user"
import { verifyPassword } from "@/utils/auth"
import { isValidObjectId } from "mongoose"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    try {
        await connectToDB()

        const isUser = await authUser();
        if (!isUser) throw new Error("This API is Protected");

        const { id } = await params

        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not Valid ID" }, { status: 422 })

        const formData = await req.formData()
        const body = Object.fromEntries(formData.entries());
        const parsed = userValidationSchema.safeParse(body);

        if (!parsed.success)
            return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

        const password = formData.get("password")
        const newPassword = formData.get("newPassword")
        const confirmPassword = formData.get("confirmPassword")

        if (newPassword && newPassword !== confirmPassword)
            return NextResponse.json({ message: "Passwords Do Not Match" }, { status: 422 })

        const user = await UserModal.findById(id)
        if (!user) return NextResponse.json({ message: "User Not Found" }, { status: 404 })

        const verifiedPassword = verifyPassword(password, user.password)

        if (!verifiedPassword) return NextResponse.json({ message: "Current Password Not Valid" }, { status: 422 })

        let hashedPassword = user.password
        if (newPassword) hashedPassword = await hashPassword(confirmPassword)

        const avatar = await handleFileUpload(formData.get("avatar")) || "";

        await UserModal.findByIdAndUpdate(id, {
            $set: {
                ...parsed.data,
                avatar,
                password: hashedPassword
            }
        })

        return NextResponse.json({ message: "User Updated Successfully" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This API Protected")

        const { id } = params
        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not Valid ID" }, { status: 422 })

        await UserModal.findByIdAndDelete(id)
        return NextResponse.json({ message: "User Removed Successfully" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}
