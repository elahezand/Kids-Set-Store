import connectToDB from "../../../../../configs/db";
import ProductModel from "../../../../../model/product";
import handleFileUpload from "@/utils/serverFile";
import { productSchema } from "../../../../../validators/product";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose"
import { authAdmin } from "@/utils/serverHelper";
/* ===================== GET ===================== */
export async function GET(req, { params }) {
    try {
        await connectToDB();
        const { id } = await params;
        if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 422 });

        const product = await ProductModel.findById(id).lean();
        if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        return NextResponse.json(product, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
}

/* ===================== DELETE ===================== */
export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 422 });

        await ProductModel.findByIdAndDelete(id);

        return NextResponse.json({ message: "Product removed" }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
}

/* ===================== PUT ===================== */
export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        if (!isValidObjectId(id)) return NextResponse.json({ message: "Invalid ID" }, { status: 422 });

        const currentProduct = await ProductModel.findById(id);
        if (!currentProduct) return NextResponse.json({ message: "Product not found" }, { status: 404 });

        const formData = await req.formData();
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


        /* optional image upload */
        const img = await handleFileUpload(formData.get("img")) || currentProduct.img;
        if (!img) return NextResponse.json({ message: "Image is required" }, { status: 400 });

        await ProductModel.findByIdAndUpdate(id, {
            $set: {
                ...validation.data,
                img,
            },
        });

        return NextResponse.json({ message: "Product updated" }, { status: 200 });
    } catch (err) {
        console.log(err);

        return NextResponse.json({ message: "Unknown Error" }, { status: 500 });
    }
}