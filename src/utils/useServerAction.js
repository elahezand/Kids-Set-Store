"use server"
import { writeFile } from "fs/promises";
import path from "path";
import connectToDB from "../../db/db";
import ArticleModel from "../../model/article";
import ProductModal from "../../model/product";
import { authAdmin } from "./serverHelper";
import { revalidatePath } from "next/cache";
export async function NewArticle(prevState, formData) {

    try {
        connectToDB()
        const user = await authAdmin()
        if (!user) throw new Error("This api Protected")


        const cover = formData.get("cover")
        const title = formData.get("title")
        const shortDescription = formData.get("shortDescription")
        const content = formData.get("content")
        const author = formData.get("author")


        if (
            !title.trim() ||
            !shortDescription.trim() ||
            !content.trim() ||
            !author.trim()) {
            return {
                message: "error",
                error: "plaese Fill out required fields",
                feilds: {
                    cover,
                    title,
                    shortDescription,
                    content,
                    author
                }
            }
        }

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
        return { success: false }
    }
}


export async function NewProduct(prevState, formData) {
    try {
        connectToDB()
        const user = await authAdmin()
        if (!user) throw new Error("This api Protected")

        const img = formData.get("img")
        const name = formData.get("name")
        const price = formData.get("price")
        const score = formData.get("score")
        const color = formData.get("color")
        const tags = formData.get("tags")
        const material = formData.get("material")
        const subSubCategory = formData.get("subSubCategory")
        const longDescription = formData.get("longDescription")
        const shortDescription = formData.get("shortDescription")

        if (
            !name.trim() ||
            !shortDescription.trim() ||
            !longDescription.trim() ||
            !color.trim() ||
            !material.trim() ||
            !subSubCategory.trim()
        ) {
            return {
                message: "error",
                error: "plaese Fill out required fields",
                feilds: {
                    img,
                    name,
                    price,
                    score,
                    color,
                    tags,
                    material,
                    subSubCategory,
                    longDescription,
                    shortDescription,
                }
            }
        }
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
                score,
                tags: JSON.parse(JSON.stringify(tags)),
                material,
                subSubCategory,
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
                    subSubCategory: "",
                    longDescription: "",
                    shortDescription: "",
                }

            }
        }
    } catch (err) {
        console.log(err);

        return { success: false }
    }
}





