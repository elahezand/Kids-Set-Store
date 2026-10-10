import User from "@/model/user";
import { hashPassword, verifyPassword } from "@/utils/auth";
import { isBanned } from "@/utils/auth/ban";
import { saveImage } from "@/utils/serverFile";
import { sendOtp, verifyOtp } from "@/services/server/shared/otp";
import { revokeAllUserSessions } from "@/services/server/shared/session";
import { profileValidationSchema } from "@/validators/user";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const fail = (status, message, details) => ({ success: false, status, message, details });

const checkNewPhone = async (userId, phone) => {
  if (await User.exists({ phone, _id: { $ne: userId } })) {
    return fail(409, "This phone number is already used", [{ field: "phone", message: "Already used" }]);
  }
  if (await isBanned(phone)) {
    return fail(403, "This phone number is banned", [{ field: "phone", message: "Banned" }]);
  }
  return null;
};

const requestPhoneCode = async (userId, phone) => {
  const user = await User.findById(userId).select("phone").lean();
  if (!user) return fail(404, "User not found");
  if (user.phone === phone) return fail(400, "This is already your phone number");

  const problem = await checkNewPhone(userId, phone);
  if (problem) return problem;

  return sendOtp(phone);
};

const updateProfile = async (userId, fields = {}, avatar = null, { sessionId = null } = {}) => {
  const parsed = profileValidationSchema.safeParse(fields);
  if (!parsed.success) {
    return fail(
      422,
      "Validation failed",
      parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
    );
  }

  const { username, email, phone, phoneCode, password, newPassword } = parsed.data;

  const user = await User.findById(userId).select("+password");
  if (!user) return fail(404, "User not found");

  const phoneChanged = phone !== user.phone;

  if (phoneChanged) {
    const problem = await checkNewPhone(userId, phone);
    if (problem) return problem;

    if (!phoneCode) {
      return fail(422, "Verify your new phone number first", [{ field: "phoneCode", message: "Required" }]);
    }

    const otp = await verifyOtp(phone, phoneCode);
    if (!otp.success) {
      return fail(otp.status, otp.message, [{ field: "phoneCode", message: otp.message }]);
    }
  }

  if (email && email !== user.email && (await User.exists({ email, _id: { $ne: userId } }))) {
    return fail(409, "This email is already used", [{ field: "email", message: "Already used" }]);
  }

  if (newPassword) {
    if (user.password) {
      if (!password) {
        return fail(422, "Enter your current password", [{ field: "password", message: "Required" }]);
      }
      if (!(await verifyPassword(password, user.password))) {
        return fail(422, "Current password is wrong", [{ field: "password", message: "Wrong password" }]);
      }
    }
    user.password = await hashPassword(newPassword);
  }

  if (avatar && avatar.size > 0) {
    if (avatar.size > AVATAR_MAX_BYTES) return fail(422, "Avatar must be smaller than 2 MB");
    const saved = await saveImage(avatar, ["jpg", "png", "webp"]);
    if (!saved) return fail(422, "Avatar must be a JPG, PNG or WEBP image");
    user.profilePicture = saved;
  }

  user.username = username;
  user.phone = phone;
  user.email = email || undefined;

  await user.save();

  if (newPassword || phoneChanged) {
    await revokeAllUserSessions(user._id, newPassword ? "password_changed" : "phone_changed", {
      exceptSessionId: sessionId,
    });
  }

  return { success: true, data: user.toJSON() };
};

export { updateProfile, requestPhoneCode };

export default { updateProfile, requestPhoneCode };
