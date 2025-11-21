import connectToDB from "../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"
import CategoryModel from "../../../../model/category"
export async function GET() {
    try {
        connectToDB()
        const categories = await CategoryModel.find({}, "-__v")
            .populate({
                path: "subCategories",
                populate: { path: "subCategories" }
            })
        return Response.json({ categories }, { status: 200 })

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
        const { title, slug, description } = reqBody

        if (!title.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })

        const iscategoryExisted = await CategoryModel.findOne({ title })

        if (!iscategoryExisted) {
            await CategoryModel.create({
                title, slug, description
            })

        }
        return Response.json({ message: "Category created Successfully" }, { status: 200 })
    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
