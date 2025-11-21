import connectToDB from "../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"
import SubCategoryModel from "../../../../model/subCategory"
import CategoryModel from "../../../../model/category"
export async function GET() {
    connectToDB()
    try {
        const subcategories = await SubCategoryModel.find({}, "-__v")
        return Response.json({ subcategories }, { status: 200 })
    }
    catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    connectToDB()
    try {

        const reqBody = await req.json()
        const { title, slug, description, parentID } = reqBody

        if (!title.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })

        const issubCategoryExist = await SubCategoryModel.findOne({ title })

        if (!issubCategoryExist) {
            const sub = await SubCategoryModel.create({
                title, slug, description, parentID

            })

            await CategoryModel.findOneAndUpdate({ _id: parentID }, {
                $push: {
                    subCategories: sub._id
                }
            })

        }

        return Response.json({ message: "subCategory created Successfully" }, { status: 200 })
    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
