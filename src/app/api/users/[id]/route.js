import connectToDB from "../../../../../db/db"
import UserModal from "../../../../../model/user"
import { authAdmin } from "@/utils/serverHelper"
import { validateEmail, validatePhone, validateUserNane } from "../../../../../validator/user"
import { isValidObjectId } from "mongoose"
export async function PUT(req, { params }) {
    connectToDB()
    try {
        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const reqBody = await req.json()
        const { username, email, phone } = reqBody

        const isuserNameValid = validateUserNane(username)
        const isphoneValid = validatePhone(phone)
        const isEmailValid = validateEmail(email)

        if (!isEmailValid || !isuserNameValid || !isphoneValid) {
            return Response.json({ message: "UserName or Email or Phone Not Valid :(" }, { status: 422 })

        }

        await UserModal.findOneAndUpdate({ _id: id }, {
            $set: {
                username,
                email,
                phone
            }
        })
        return Response.json("user UPDATED successfully", { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnownError" }, { status: 500 })
    }

}


export async function DELETE(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params

        const isvalidId = isValidObjectId(id)
        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        await UserModal.findOneAndDelete({ _id: id })

        return Response.json({ message: "User Removed" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnownError" }, { status: 500 })
    }

}


