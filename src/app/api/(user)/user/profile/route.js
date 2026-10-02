import connectToDB from "@/configs/db";
import profileService from "@/services/server/user/profile";
import { authUser } from "@/utils/auth/authGuard";
import { formDataToObject, fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

/* PATCH /api/user/profile  (multipart FormData, `avatar` is an optional image file) */
export async function PATCH(request) {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const formData = await request.formData();
        const { avatar, ...fields } = formDataToObject(formData);

        const result = await profileService.updateProfile(
            user._id,
            fields,
            typeof avatar === "object" ? avatar : null
        );

        return fromService(result, { message: "Profile updated" });
    } catch (error) {
        return handleRouteError(error);
    }
}
