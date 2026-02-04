
import connectToDB from "../../../../configs/db";
import commentModel from "../../../../model/comment";
import { commentValidationSchema } from "@/validators/comment";
import { NextResponse } from "next/server";
import { getMe } from "@/utils/serverHelper";
import ProductModel from "../../../../model/product";
import { paginate } from "@/utils/helper";
export async function GET(req) {
    try {
        await connectToDB();
        const { searchParams } = new URL(req.url);

        const useCursor = searchParams.has("cursor");
        const productId = searchParams.get("productId")

        const result = await paginate(
            commentModel,               // Model
            searchParams,               // searchParams
            productId ? { productID: productId } : {}, // filter
            null,                       // populate
            useCursor,
            true                  // cursor /page
        );

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectToDB();

        const user = await getMe();
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        body.score = Number(body.score);

        const parsed = commentValidationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const product = await ProductModel.findById(body.product);
        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        await commentModel.create({
            ...parsed.data,
            product: body.product,
            user: user._id,
        });

        return NextResponse.json(
            { message: "Comment sent successfully" },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}
