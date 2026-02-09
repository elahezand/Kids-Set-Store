import connectToDB from "../../../../../../configs/db";
import { authAdmin } from "@/utils/serverHelper";
import UserModel from "../../../../../../model/user";
import { NextResponse } from "next/server";

// app/api/users/role/[id]/route.js
export async function PUT(req, { params }) {
    try {
        await connectToDB();
        const admin = await authAdmin();
        if (!admin) throw new Error("This API is protected");
     
        const { id } = await params;
        const user = await UserModel.findById(id);
        const newRole = user.role === "USER" ? "ADMIN" : "USER";
        await UserModel.findByIdAndUpdate(id, { role: newRole });

        return NextResponse.json({ message: "Role updated!" });
    } catch (err) {
        console.log(err);
        
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}