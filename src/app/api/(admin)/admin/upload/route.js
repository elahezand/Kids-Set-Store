import connectToDB from "@/configs/db";
import { authAdmin } from "@/utils/auth/authGuard";
import handleFileUpload from "@/utils/serverFile";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();
        if (!admin || admin.status === "expired") return jsonError("Unauthorized", 401);

        const formData = await request.formData().catch(() => null);
        if (!formData) return jsonError("Send the images as multipart form data", 400);

        const files = formData.getAll("files").filter((file) => typeof file === "object" && file.size > 0);

        if (!files.length) return jsonError("Choose at least one image", 400);
        if (files.length > MAX_FILES) return jsonError(`At most ${MAX_FILES} images at once`, 400);

        for (const file of files) {
            if (!IMAGE_TYPES.includes(file.type)) return jsonError(`${file.name}: only JPG, PNG, WEBP or AVIF`, 422);
            if (file.size > MAX_BYTES) return jsonError(`${file.name}: images must be at most 5 MB`, 422);
        }

        const paths = [];
        for (const file of files) paths.push(await handleFileUpload(file));

        return respond({ message: "Uploaded", data: paths }, { status: 201 });
    } catch (error) {
        return handleRouteError(error, "POST /api/admin/upload");
    }
}
