import connectToDB from "@/configs/db";
import { cookies } from "next/headers";
import profileService from "@/services/server/user/profile";
import { authUser } from "@/utils/auth/authGuard";
import { verifyToken } from "@/utils/auth";
import { formDataToObject, fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

export async function PATCH(request) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

    const formData = await request.formData();
    const { avatar, ...fields } = formDataToObject(formData);

    const accessToken = (await cookies()).get("accessToken")?.value;
    const payload = accessToken ? await verifyToken(accessToken) : null;

    const result = await profileService.updateProfile(user._id, fields, typeof avatar === "object" ? avatar : null, {
      sessionId: payload?.sid ?? null,
    });

    return fromService(result, { message: "Profile updated" });
  } catch (error) {
    return handleRouteError(error, "PATCH /api/user/profile");
  }
}
