
import connectToDB from "../../../../../../configs/db"
import UserModel from "../../../../../../model/user"
export async function POST(req) {
    try {
        await connectToDB()
        const reqBody = await req.json()
        const { phone } = reqBody
        const phoneValidate = validatePhone(phone)

        if (!phoneValidate) return Response.json({ message: "NoT valid" }, { status: 422 })


        const isUserExist = await UserModel.findOne({ phone })

        if (isUserExist) return Response.json({ message: "this account already existed !" }, { status: 409 })
        return Response.json({ message: "You can Register" }, { status: 200 })
    }
    catch (err) {
        Response.json({ message: "Unknown Error" }, { status: 500 })
    }

}






