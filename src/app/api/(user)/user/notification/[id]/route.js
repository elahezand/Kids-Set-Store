import connectToDB from "@/configs/db";
import notificationService from "@/services/server/user/notification";
import { authUser } from "@/utils/auth/authGuard";
import validateObjectId from "@/utils/validateObjectId";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export async function GET(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user || user.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid id", 400);
        }

        const result = await notificationService.get(
            id,
            user._id
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PATCH(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user || user.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid id", 400);
        }

        const result = await notificationService.markSeen(
            id,
            user._id
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            data: result.data,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user || user.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const { id } = await params;

        if (!validateObjectId(id)) {
            return jsonError("Invalid id", 400);
        }

        const result = await notificationService.remove(
            id,
            user._id
        );

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond({
            success: true,
            message: "Notification removed",
        });
    } catch (error) {
        return handleRouteError(error);
    }
}