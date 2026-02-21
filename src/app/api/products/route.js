import connectToDB from "../../../../configs/db"
import ProductModal from "../../../../model/product"
import CategoryModel from "../../../../model/category"
import { paginate } from "@/utils/helper"
import { NextResponse } from "next/server"

export async function GET(req) {
    try {
        await connectToDB()
        const { searchParams } = new URL(req.url)

        const categoryName = searchParams.get("category")
        const value = searchParams.get("value")
        const color = searchParams.get("color")
        const material = searchParams.get("material")
        const maxPrice = searchParams.get("max")
        const sortType = searchParams.get("sort")

        const useCursor =
            searchParams.has("cursor") &&
            (!sortType || sortType === "latest")

        let filter = {}

        if (categoryName) {
            const category = await CategoryModel.findOne({ slug: categoryName })
            if (category) filter.categoryPath = category._id
        }

        if (color && color !== "-1") filter.color = color

        if (material && material !== "-1") {
            filter.material = { $regex: material, $options: "i" }
        }

        if (maxPrice) filter.price = { $lte: Number(maxPrice) }

        if (value === "bestSelling") filter.score = { $gte: 4 }

        let sortOption = { _id: -1 }

        if (sortType === "price") {
            sortOption = { price: 1, _id: -1 }
        }

        if (sortType === "popularity") {
            sortOption = { score: -1, _id: -1 }
        }

        if (sortType === "latest") {
            sortOption = { _id: -1 }
        }

        const result = await paginate(
            ProductModal,
            searchParams,
            filter,
            null,
            useCursor,
            true,
            sortOption
        )

        return NextResponse.json(result, { status: 200 })

    } catch (err) {
        console.error("Error in GET products:", err)
        return NextResponse.json({ message: "Unknown Error" }, { status: 500 })
    }
}

export async function POST(req) {
    try {
        await connectToDB()
        const admin = await authAdmin()
        if (!admin) throw new Error("This api Protected")

        const formData = await req.formData()
        const rawData = Object.fromEntries(formData.entries());

        const processedData = {
            ...rawData,
            price: Number(rawData.price),
            score: rawData.score ? Number(rawData.score) : 5,
            tags: rawData.tags ? rawData.tags.split(",").map(t => t.trim()) : [],
            availableSizes: rawData.availableSizes ? rawData.availableSizes.split(",").map(v => v.trim()) : [],
            categoryPath: rawData.categoryPath ? JSON.parse(rawData.categoryPath) : []
        };

        const validation = productSchema.safeParse(processedData);
        
        if (!validation.success) {
            console.log("Validation Errors:", validation.error.flatten().fieldErrors);
            return {
                status: 400,
                message: "error",
                errors: validation.error.flatten().fieldErrors
            };
        }


        const isProductExist = await ProductModal.findOne({ name: validation.data.name });
        if (isProductExist) {
            return createResponse(409, "Product Already Existed");
        }


        const imageFile = formData.get("img");
        let imgPath = "";
        if (imageFile && imageFile.size > 0) {
            imgPath = await handleFileUpload(imageFile);
        }

        await ProductModal.create({
            ...validation.data,
            img: imgPath,
        });
        return NextResponse.json({ message: "Product Created Successfully" },
            { status: 200 }, { data: product })
    }
    catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 })
    }

}
