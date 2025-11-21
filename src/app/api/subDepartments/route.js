import DepartmentModel from "../../../../model/department"
import SubDepartmentModel from "../../../../model/subDepartment"
import connectToDB from "../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"
export async function GET() {
    try {
        connectToDB()
        const subDepartments = await SubDepartmentModel.find()
        return Response.json({ subDepartments }, { status: 200 })
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
        const { title, department } = reqBody

        if (!title.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })

        await SubDepartmentModel.create({
            title, department
        })

        return Response.json({ message: "SubDepartment created Successfully" }, { status: 200 })
    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
