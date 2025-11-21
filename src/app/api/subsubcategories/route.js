import connectToDB from "../../../../db/db"
import { authAdmin } from "@/utils/serverHelper"
import SubCategoryModel from "../../../../model/subCategory"
import CategoryModel from "../../../../model/category"
import SubSubCategoryModel from "../../../../model/subSubCategory"
export async function GET() {
    try {
        connectToDB()
        const subsubcategories = await SubSubCategoryModel.find({}, "-__v")
        return Response.json({ subsubcategories }, { status: 200 })
    }
    catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        connectToDB()

        const reqBody = await req.json()
        const { title, slug, description, parentID, subParent } = reqBody

        if (!title.trim()) return Response.json({ message: "Title Not Valid :(" }, { status: 422 })


        const sub = await SubSubCategoryModel.create({
            title, slug, description, parentID, subParent
        })

        await SubCategoryModel.findOneAndUpdate({ _id: subParent, parentID: parentID }, {
            $push: {
                subCategories: sub._id
            }
        })

        return Response.json({ message: "subCategory created Successfully" }, { status: 200 })
    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }

}
