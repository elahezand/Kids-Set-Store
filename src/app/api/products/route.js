import connectToDB from "../../../../configs/db"
import ProductModal from "../../../../model/product"
import CategoryModel from "../../../../model/category"
import { paginate } from "@/utils/paginate"
import { NextResponse } from "next/server"
import ProductModel from "../../../../model/product"
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const categoryName = searchParams.get("category");
    const value = searchParams.get("value");
    const color = searchParams.get("color");
    const material = searchParams.get("material");
    const maxPrice = searchParams.get("max");
    const sortType = searchParams.get("sort");

    const filters = {};

    // Category
    if (categoryName) {
      const category = await CategoryModel.findOne({
        slug: categoryName,
      }).lean();

      if (category) {
        filters.categoryPath = category._id;
      }
    }

    // Color
    if (color && color !== "-1") {
      filters.color = color;
    }

    // Material
    if (material && material !== "-1") {
      filters.material = {
        $regex: material,
        $options: "i",
      };
    }

    // Max price
    if (maxPrice) {
      const price = Number(maxPrice);

      if (!Number.isNaN(price)) {
        filters.price = {
          $lte: price,
        };
      }
    }

    // Best selling
    if (value === "bestSelling") {
      filters.score = {
        $gte: 4,
      };
    }

    // Sort
    let sortOption = {
      _id: -1,
    };

    if (sortType === "price") {
      sortOption = {
        price: 1,
        _id: -1,
      };
    }

    if (sortType === "popularity") {
      sortOption = {
        score: -1,
        _id: -1,
      };
    }

    if (sortType === "latest") {
      sortOption = {
        _id: -1,
      };
    }

    const result = await paginate(ProductModel, {
      limit,
      cursor,
      filters,
      sort: sortOption,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: "Unknown Error",
      },
      {
        status: 500,
      }
    );
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
