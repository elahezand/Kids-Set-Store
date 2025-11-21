import ArticleModel from "../../../../../model/article"
import connectToDB from "../../../../../db/db"
import { isValidObjectId } from "mongoose"
import { authAdmin } from "@/utils/serverHelper"
import { writeFile } from "fs/promises"
import path from "path"
export async function GET(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) {
            throw new Error("This api Protected")
        }
        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })


        const article = await ArticleModel.findOne({ _id: id })
            .lean()
        if (!article) throw new Error(`Failed to get data`);

        return Response.json(article, { status: 200 })


    } catch (err) {
        return Response.json({ message: err.message }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) {
            throw new Error("This api Protected")
        }
        const { id } = await params

        if (!isValidObjectId(id)) {
            return Response.json({ message: "Not Found" }, { status: 404 })
        }


        await ArticleModel.findOneAndDelete({ _id: id })
        return Response.json({ message: "Article Removed" }, { status: 200 })


    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 200 })

    }

}


export async function PUT(req, { params }) {
    connectToDB()
    try {
        const user = await authAdmin()
        if (!user) {
            throw new Error("This api Protected")
        }

        const { id } = await params
        if (!isValidObjectId(id)) {
            return Response.json({ message: "Not Found" }, { status: 404 })
        }

        const formData = await req.formData()

        const cover = formData.get("cover")
        const title = formData.get("title")
        const shortDescription = formData.get("shortDescription")
        const content = formData.get("content")
        const author = formData.get("author")
        const status = formData.get("status")


        const buffer = Buffer.from(await cover.arrayBuffer())
        const filename = Date.now() + cover.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        await ArticleModel.findOneAndUpdate({ _id: id }, {
            $set: {
                title,
                author,
                shortDescription,
                content,
                status: status,
                cover: `http://localhost:3000/uploads/${filename}`
            }
        })
        return Response.json({ message: "Article Updated" }, { status: 200 })

    } catch (err) {

        return Response.json({ message: "UnKnown Error" }, { status: 200 })

    }

}

