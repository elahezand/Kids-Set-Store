import connectToDB from "../../../../../configs/db"
import UserModel from "../../../../../model/user"
import { authAdmin } from "@/utils/serverHelper"
import { verifyPassword } from "@/utils/auth"
import handleFileUpload from "@/utils/serverFile"
import { isValidObjectId } from "mongoose"
import { NextResponse } from "next/server"
import { z } from "zod";

const userValidationSchema = z.object({
    username: z.string().min(2, "Username too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone"),
});

export async function PUT(req, { params }) {
    try {
        await connectToDB();
        const isUser = await authAdmin();
        if (!isUser) throw new Error("This API is Protected");

        const { id } = await params;

        if (!isValidObjectId(id))
            return NextResponse.json({ message: "Not Valid ID" }, { status: 422 });

        const formData = await req.formData();
        const body = Object.fromEntries(formData.entries());
        const parsed = userValidationSchema.safeParse(body);

        if (!parsed.success)
            return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

        const { password, newPassword, confirmPassword, avatar } = body;

        if (newPassword && newPassword !== confirmPassword)
            return NextResponse.json({ message: "Passwords Do Not Match" }, { status: 422 });

        const user = await UserModel.findById(id);
        if (!user) return NextResponse.json({ message: "User Not Found" }, { status: 404 });

        const verifiedPassword = verifyPassword(password, user.password);
        if (!verifiedPassword)
            return NextResponse.json({ message: "Current Password Not Valid" }, { status: 422 });

        let hashedPassword = user.password;
        if (newPassword) hashedPassword = await hashPassword(confirmPassword);

        const uploadedAvatar = avatar ? await handleFileUpload(avatar) : "";

        await UserModel.findByIdAndUpdate(id, {
            $set: {
                ...parsed.data,
                avatar: uploadedAvatar,
                password: hashedPassword
            }
        });

        return NextResponse.json({ message: "User Updated Successfully" }, { status: 200 });

    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: err.message }, { status: 500 });
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

        await UserModel.findByIdAndDelete(id)
        return NextResponse.json({ message: "User Removed Successfully" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }
}
