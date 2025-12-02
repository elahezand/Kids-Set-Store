import connectToDB from "../../../../db/db"
import ProductModal from "../../../../model/product"
import commentModel from "../../../../model/comment"
import { NextResponse } from "next/server"
import { authAdmin } from "@/utils/serverHelper"
import path from "path"
import { writeFile } from "fs/promises"
import { productSchema } from "@/validators/product";
import { StrictMode } from "react"


export async function GET() {
    try {
        connectToDB()
        const Products = await ProductModal.find({}, "-__v").populate("comments").lean()
        return NextResponse.json(Products, { status: 200 })
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
        const body = Object.fromEntries(formData.entries());

        body.price = Number(body.price);
        body.score = Number(body.score);

        const parsed = productSchema.safeParse(body);

        if (!parsed.success) {
            return Response.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }


        const img = formData.get("img")
        const name = formData.get("name")
        const price = formData.get("price")
        const score = formData.get("score")
        const color = formData.get("color")
        const tags = formData.get("tags")
        const material = formData.get("material")
        const size = formData.get("size")
        const categoryId = formData.get("subSubCategory")
        const longDescription = formData.get("longDescription")
        const shortDescription = formData.get("shortDescription")


        const buffer = Buffer.from(await img.arrayBuffer())
        const filename = Date.now() + img.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        const isProductExist = await ProductModal.findOne({ name })

        if (!isProductExist) {
            const product = await ProductModal.create({
                name,
                price,
                longDescription,
                shortDescription,
                score,
                tags: JSON.parse(JSON.stringify(tags)),
                material,
                categoryId,
                size: JSON.parse(JSON.stringify(size)),
                isAvailable,
                color,
                img: `http://localhost:3000/uploads/${filename}`
            })
            return NextResponse.json({ message: "Product Created Successfully" },
                { status: 200 }, { data: product })
        }
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }

}


