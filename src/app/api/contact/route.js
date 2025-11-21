import connectToDB from "../../../../db/db"
import contactModel from "../../../../model/contact"
import { validateEmail, validateUserNane, validatePhone } from "../../../../validator/user"
export async function GET() {
    try {
        connectToDB()
        const contacts = await contactModel.find({})
        return Response.json({ contacts }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })

    }
}

export async function POST(req) {
    try {
        connectToDB()
        const reqBody = await req.json()
        const { name, company, body, email, phone } = reqBody

        const isValidateUsername = validateUserNane(name)
        const isValidateEmail = validateEmail(email)
        const isValidatePhone = validatePhone(phone)

        if (!isValidateEmail ||
            !isValidateUsername ||
            !isValidatePhone) return Response.json({ message: "Name or Email or Phone Not Valid" }, { status: 422 })


        await contactModel.create({
            name, company, body, email, phone
        })
        return Response.json({ message: "your Request was sent Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })

    }
}

