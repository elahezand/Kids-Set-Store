import connectToDB from "@/configs/db";
import commentService from "@/services/server/user/comment";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, validationError, respond, paginated } from "@/utils/apiResponse";
import validate from "@/utils/validate";
import { createCommentSchema } from "@/validators/comment";

export async function GET(request) {
    try {
        await connectToDB();

        const user = await authUser();
        if (!user || user.status === "expired") return jsonError("Unauthorized", 401);

        const query = Object.fromEntries(new URL(request.url).searchParams.entries());
        return paginated(await commentService.getMine(user._id, query));
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request) {
    try {
        await connectToDB();

        const user = await authUser();

        if (!user || user.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const body = await request.json().catch(() => ({}));

        const parsed = validate(createCommentSchema, body);

        if (!parsed.success) {
            return validationError(parsed.errors);
        }

        // the form / API send productId, the Comment model field is `product`
        const { productId, ...rest } = parsed.data;

        const result = await commentService.create(user._id, {
            ...rest,
            product: productId,
        });

        if (!result.success) {
            return jsonError(result.message, result.status);
        }

        return respond(
            {
                success: true,
                data: result.data,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleRouteError(error);
    }
}