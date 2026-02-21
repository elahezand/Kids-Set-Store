import connectToDB from "../../../../configs/db";
import ArticleModel from "../../../../model/article";
import { authAdmin } from "@/utils/serverHelper";
import { NextResponse } from "next/server";
import { articleSchema } from "../../../../validators/article";
import handleFileUpload from "@/utils/serverFile";
import { paginate } from "@/utils/helper";

export async function GET(req) {
  try {
    await connectToDB();
    const admin = await authAdmin();
    if (!admin) throw new Error("This API is protected");

    const { searchParams } = new URL(req.url);
    const useCursor = searchParams.has("cursor");

    const result = await paginate(
      ArticleModel,    // Model
      searchParams,    // searchParams
      {},              // filter
      null,            // populate
      useCursor,       // useCursor
      true             // cursor/page mode
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Unknown Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDB();
    const admin = await authAdmin();
    if (!admin) throw new Error("This API is protected");

    const formData = await req.formData();
    const rawData = Object.fromEntries(formData.entries());

    const parsed = articleSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isArticleExist = await ArticleModel.findOne({ name: parsed.data.name });
    if (isArticleExist) {
      return NextResponse.json({ message: "Article already exists" }, { status: 409 });
    }

    let imgPath = "";
    const imageFile = formData.get("cover");
    if (imageFile && imageFile.size > 0) {
      imgPath = await handleFileUpload(imageFile);
    }

    const article = await ArticleModel.create({
      ...parsed.data,
      cover: imgPath,
    });

    return NextResponse.json(
      { message: "Article created successfully", data: article },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ message: err.message || "Unknown Error" }, { status: 500 });
  }
}