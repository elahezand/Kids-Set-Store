"use server"
import connectToDB from "../../../configs/db";
import ArticleModel from "../../../model/article";
import { articleSchema } from "../../../validators/article";
import { authAdmin } from "../serverHelper";
import handleFileUpload from "../serverFile";
const createResponse = (status, message, data = null, errors = null) => {
    return { status, message, data, errors };
};
export async function NewArticle(prevState, formData) {
    try {
        await connectToDB();
        const admin = await authAdmin()
        if (!admin || admin.role !== "ADMIN") {
            return createResponse(403, "UnAuthorized");
        }

        const rawData = Object.fromEntries(formData.entries());
        const validation = articleSchema.safeParse(rawData);

        if (!validation.success) {
            return createResponse(400, "", null, validation.error.flatten().fieldErrors);
        }

        const status = formData.get("status");
        const draftArticle = await ArticleModel.findOne({ title: validation.data.title, status: "unpublish" });
        const cover = await handleFileUpload(formData.get("cover")) || draftArticle?.cover || "";

        if (draftArticle) {
            await ArticleModel.findByIdAndUpdate(draftArticle._id, {
                ...validation.data,
                cover,
                status
            });
        } else {
            await ArticleModel.create({
                ...validation.data,
                cover,
                status
            });
        }
        return createResponse(201, " Reservation Created successfully:)");

    } catch (err) {
        console.error("Critical Error in NewArticle Action:", err);
        return createResponse(500, "UNKNOWN ERROR");
    }
}
