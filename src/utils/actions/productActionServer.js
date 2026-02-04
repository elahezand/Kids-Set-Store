"use server"
import connectToDB from "../../../configs/db";
import ProductModal from "../../../model/product";
import { productSchema } from "../../../validators/product";
import handleFileUpload from "../serverFile";
import { authAdmin } from "../serverHelper";

const createResponse = (status, message, data = null, errors = null) => {
    return { status, message, data, errors };
};

export async function NewProduct(prevState, formData) {
    try {
        await connectToDB();
        
        const admin = await authAdmin();
        if (!admin) return createResponse(403, "UnAuthorized");

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

        return {
            status: 201,
            message: "success" 
        };

    } catch (err) {
        console.error("Critical Error in NewProduct Action:", err);
        return {
            status: 500,
            message: "error"
        };
    }
}