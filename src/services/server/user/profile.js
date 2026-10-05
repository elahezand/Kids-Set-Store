import User from "@/model/user";
import { hashPassword, verifyPassword } from "@/utils/auth";
import handleFileUpload from "@/utils/serverFile";
import { profileValidationSchema } from "@/validators/user";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const fail = (status, message, details) => ({ success: false, status, message, details });

const updateProfile = async (userId, fields = {}, avatar = null) => {
    const parsed = profileValidationSchema.safeParse(fields);
    if (!parsed.success) {
        return fail(
            422,
            "Validation failed",
            parsed.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
        );
    }

    const { username, email, phone, password, newPassword } = parsed.data;

    const user = await User.findById(userId).select("+password");
    if (!user) return fail(404, "User not found");

    if (phone !== user.phone && (await User.exists({ phone, _id: { $ne: userId } }))) {
        return fail(409, "This phone number is already used", [{ field: "phone", message: "Already used" }]);
    }
    if (email && email !== user.email && (await User.exists({ email, _id: { $ne: userId } }))) {
        return fail(409, "This email is already used", [{ field: "email", message: "Already used" }]);
    }

    if (newPassword) {
        // users created by SMS login have no password yet -> they can set one directly
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
        if (!AVATAR_TYPES.includes(avatar.type)) return fail(422, "Avatar must be a JPG, PNG or WEBP image");
        if (avatar.size > AVATAR_MAX_BYTES) return fail(422, "Avatar must be smaller than 2 MB");
        user.profilePicture = await handleFileUpload(avatar);
    }

    user.username = username;
    user.phone = phone;
    user.email = email || undefined;

    await user.save();

    return { success: true, data: user.toJSON() };
};

export { updateProfile };

export default { updateProfile };
