import connectToDB from "../../../../db/db"
import ArticleModel from "../../../../model/article"
import { authAdmin } from "@/utils/serverHelper"
import path from "path"
import { writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import { validateUserNane } from "../../../../validator/user"
export async function GET() {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const articles = await ArticleModel.find({}, "-__v")
        return NextResponse.json(articles, { status: 200 })
    } catch (err) {
        return NextResponse.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")


        const formData = await req.formData()

        const cover = formData.get("cover")
        const title = formData.get("title")
        const shortDescription = formData.get("shortDescription")
        const content = formData.get("content")
        const author = formData.get("author")

        const titlevalidate = validateUserNane(title)
        const authorvalidate = validateUserNane(author)


        if (!titlevalidate) return NextResponse.json({ message: "Title Not Valid" }, { status: 422 })
        if (!authorvalidate) return NextResponse.json({ message: "Author Not Valid" }, { status: 422 })




        const buffer = Buffer.from(await cover.arrayBuffer())
        const filename = Date.now() + cover.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        const isArticletExist = await ArticleModel.findOne({ title })

        if (!isArticletExist) {
            const article = await ArticleModel.create({
                title,
                author,
                shortDescription,
                content,
                status: "published",
                cover: `http://localhost:3000/uploads/${filename}`
            })
            return NextResponse.json({ message: "article Created Successfully" },
                { status: 200 }, { data: article })
        }
    } catch (err) {

        return NextResponse.json({ message: err.message }, { status: 500 })
    }

}


