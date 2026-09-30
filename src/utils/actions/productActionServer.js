"use server"
import connectToDB from "@/configs/db";
import ProductModel from "@/model/product";
import { productFormSchema } from "@/validators/product";
import { buildProductPayload } from "@/utils/productForm";
import handleFileUpload from "@/utils/serverFile";
import { authAdmin } from "@/utils/auth/authGuard";

const createResponse = (status, message, data = null, errors = null) => ({ status, message, data, errors });

export async function NewProduct(prevState, formData) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return createResponse(403, "UnAuthorized");

        const raw = Object.fromEntries(formData.entries());
        let categoryPath = [];
        try {
            categoryPath = raw.categoryPath ? JSON.parse(raw.categoryPath) : [];
        } catch {
            categoryPath = [];
        }

        const validation = productFormSchema.safeParse({ ...raw, categoryPath });
        if (!validation.success) {
            return {
                status: 400,
                message: "error",
                errors: validation.error.flatten().fieldErrors,
            };
        }

        const exists = await ProductModel.findOne({ title: validation.data.title }).select("_id").lean();
        if (exists) return createResponse(409, "Product Already Existed");

        const images = [];
        for (const file of formData.getAll("images")) {
            const path = await handleFileUpload(file);
            if (path) images.push(path);
        }

        await ProductModel.create(buildProductPayload(validation.data, images));

        return { status: 201, message: "success" };
    } catch (err) {
        console.error("Critical Error in NewProduct Action:", err);
        return { status: 500, message: "error" };
    }
}
