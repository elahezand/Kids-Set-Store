import connectToDB from "@/configs/db";
import profileService from "@/services/server/user/profile";
import { authUser } from "@/utils/auth/authGuard";
import { phoneCodeRequestSchema } from "@/validators/user";
import { rateLimit } from "@/utils/rateLimit";
import { fromService, handleRouteError, jsonError } from "@/utils/apiResponse";

export async function POST(request) {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

    const body = await request.json().catch(() => ({}));
    const parsed = phoneCodeRequestSchema.safeParse(body);
    if (!parsed.success) return jsonError("Enter a valid phone number", 422);

    const limited = await rateLimit([{ key: `phone-code:user:${user._id}`, limit: 5, window: 60 * 60 }]);
    if (limited) return limited;

    return fromService(await profileService.requestPhoneCode(user._id, parsed.data.phone));
  } catch (error) {
    return handleRouteError(error, "POST /api/user/profile/phone-code");
  }
}
