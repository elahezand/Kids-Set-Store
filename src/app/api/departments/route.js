import DepartmentModel from "../../../../model/department"
import connectToDB from "../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"
export async function GET() {
    try {
        connectToDB()
        const departments = await DepartmentModel.find({}, "-__v")
        return Response.json({ departments }, { status: 200 })
    }
    catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const reqBody = await req.json()
        const { title } = reqBody


        if (!title.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })


        await DepartmentModel.create({
            title
        })


        return Response.json({ message: "Department created Successfully" }, { status: 200 })
    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
