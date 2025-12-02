"use server"
import { writeFile } from "fs/promises";
import path from "path";
import connectToDB from "../../db/db";
import ArticleModel from "../../model/article";
import ProductModal from "../../model/product";
import { authAdmin } from "./serverHelper";
import { revalidatePath } from "next/cache";
import { productSchema } from "../../validator/product";
import { articleSchema } from "../../validator/article";
export async function NewArticle(prevState, formData) {

    try {
        connectToDB()
        const user = await authAdmin()
        if (!user) throw new Error("This api Protected")

        const body = Object.fromEntries(formData.entries());

        const parsed = articleSchema.safeParse(body);

        if (!parsed.success) {
            return {
                message: "error",
                error: "plaese Fill out required fields",
            }

        }

        const cover = formData.get("cover")
        const title = formData.get("title")
        const shortDescription = formData.get("shortDescription")
        const content = formData.get("content")
        const author = formData.get("author")



        const buffer = Buffer.from(await cover.arrayBuffer())
        const filename = Date.now() + cover.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        const isArticletExist = await ArticleModel.findOne({ title })

        if (!isArticletExist) {
            await ArticleModel.create({
                title,
                author,
                shortDescription,
                content,
                status: "published",
                cover: `http://localhost:3000/uploads/${filename}`
            })
            revalidatePath("/")

        }
        return {
            message: "success",
            error: undefined,
            feilds: {
                cover: "",
                title: "",
                shortDescription: "",
                content: "",
                author: ""
            }
        }
    }

    catch (err) {
        console.log(err);

        return { success: false }
    }
}


export async function NewProduct(prevState, formData) {
    try {
        connectToDB()
        const user = await authAdmin()
        if (!user) throw new Error("This api Protected")

        const body = Object.fromEntries(formData.entries());

        body.price = Number(body.price);

        if (body.tags) {
            body.tags = body.tags.split(",").map(t => t.trim());
        }

        if (body.availableSizes) {
            body.availableSizes = body.availableSizes.split(",").map(s => s.trim());
        }

        const parsed = productSchema.safeParse(body);

        if (!parsed.success) {
            return {
                message: "error",
                error: "plaese Fill out required fields",
            }

        }


        const img = formData.get("img")
        const name = formData.get("name")
        const price = formData.get("price")
        const color = formData.get("color")
        const tags = formData.get("tags")
        const availableSizes = formData.get("availableSizes")
        const categoryId = formData.get("categoryId")
        const material = formData.get("material")
        const longDescription = formData.get("longDescription")
        const shortDescription = formData.get("shortDescription")



        const buffer = Buffer.from(await img.arrayBuffer())
        const filename = Date.now() + img.name
        await writeFile(path.join(process.cwd(), "public/uploads/" + filename), buffer)

        const isProductExist = await ProductModal.findOne({ name })

        if (!isProductExist) {
            await ProductModal.create({
                name,
                price,
                longDescription,
                shortDescription,
                score: 5,
                tags: JSON.parse(JSON.stringify(tags)),
                material,
                categoryId,
                availableSizes: JSON.parse(JSON.stringify(availableSizes)),
                isAvailable: true,
                color,
                img: `http://localhost:3000/uploads/${filename}`
            })
            revalidatePath("/")
            return {
                message: "success",
                error: undefined,
                feilds: {
                    img: "",
                    name: "",
                    price: "",
                    score: "",
                    color: "",
                    tags: "",
                    material: "",
                    size: "",
                    categoryId: "",
                    longDescription: "",
                    shortDescription: "",
                }

            }
        }
    } catch (err) {
        return { success: false }
    }
}





