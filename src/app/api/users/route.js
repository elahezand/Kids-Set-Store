import UserModal from "../../../../model/user";
import connectToDB from "../../../../db/db";
import { authAdmin } from "@/utils/serverHelper";
export async function GET(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")


        const users = await UserModal.find({})
            .populate("comments", "-email -username").lean()

        if (!users) return Response.json({ message: "Not FOUND" }, { status: 404 })


        return Response.json(users, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: err.message }, { status: 500 })
    }
}
