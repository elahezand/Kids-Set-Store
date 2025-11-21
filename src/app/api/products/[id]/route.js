import ProductModal from "../../../../../model/product"
import connectToDB from "../../../../../db/db"
import { isValidObjectId } from "mongoose"
import commentModel from "../../../../../model/comment"
import { authAdmin } from "@/utils/serverHelper"
import { writeFile } from "fs/promises"
import path from "path"
export async function GET(req, { params }) {
    try {
        connectToDB()
        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const product = await ProductModal.findOne({ _id: id })
            .populate("comments")
            .lean()
        return Response.json(product, { status: 200 })

    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        await ProductModal.findOneAndDelete({ _id: id })
        return Response.json({ message: "Product Removed" }, { status: 200 })


    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 200 })

    }

}


export async function PUT(req, { params }) {
    try {
        connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const { id } = await params
        const isvalidId = isValidObjectId(id)

        if (!isvalidId) return Response.json({ message: "Not Valid :)" }, { satatus: 422 })

        const formData = await req.formData()

        const img = formData.get("img")
        const name = formData.get("name")
        const price = formData.get("price")
        const size = formData.get("size")
        const color = formData.get("color")
        const suitableFor = formData.get("suitableFor")
        const material = formData.get("material")
        const tags = formData.get("tags")

        const buffer = Buffer.from(await img.arrayBuffer())
        const filename = Date.now() + img.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        await ProductModal.findOneAndUpdate({ _id: id }, {
            $set: {
                img: `http://localhost:3000/uploads/${filename}`,
                name,
                size,
                color,
                suitableFor,
                material,
                price,
                tags: JSON.parse(JSON.stringify(tags))
            }
        })
        return Response.json({ message: "Product Updated" }, { status: 200 })

    } catch (err) {
        return Response.json({ message: "UnKnown Error" }, { status: 200 })

    }

}

