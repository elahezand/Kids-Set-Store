import connectToDB from "../../../../configs/db"
import { authAdmin } from "@/utils/serverHelper"
import CategoryModel from "../../../../model/category"
export async function GET() {
    try {
        await connectToDB()
        const categories = await CategoryModel.find({}, "-__v")
        return Response.json({ categories }, { status: 200 })

    }
    catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const reqBody = await req.json()
        const { name, slug, parentId } = reqBody

        if (!name.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })

        const iscategoryExisted = await CategoryModel.findOne({ name })

        if (!iscategoryExisted) {
            await CategoryModel.create({
                name,
                parentId,
                slug
            });


        }
        return Response.json({ message: "Category created Successfully" }, { status: 200 })
    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
