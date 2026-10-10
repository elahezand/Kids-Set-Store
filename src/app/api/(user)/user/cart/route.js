import connectToDB from "@/configs/db";
import cartService from "@/services/server/user/cart";
import { authUser } from "@/utils/auth/authGuard";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

const readBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

export async function GET() {
  try {
    await connectToDB();

    const user = await authUser();
    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const result = await cartService.getUserCart(user._id);

    return respond({
      success: true,
      data: result,
    });
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

    const body = await readBody(request);

    const result = await cartService.addToCart(user._id, body.items);

    if (!result.success) {
      return jsonError(result.message, result.status, result.details);
    }

    return respond({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[cart POST]", error);
    return handleRouteError(error);
  }
}

export async function PATCH(request) {
  try {
    await connectToDB();

    const user = await authUser();

    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const body = await readBody(request);
    const result = await cartService.updateCart(user._id, body);

    if (!result.success) {
      return jsonError(result.message, result.status, result.details);
    }

    return respond({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[cart PATCH]", error);
    return handleRouteError(error);
  }
}

export async function DELETE(request) {
  try {
    await connectToDB();

    const user = await authUser();

    if (!user || user.status === "expired") {
      return jsonError("Unauthorized", 401);
    }

    const body = await readBody(request);

    const itemId = body.itemId ?? new URL(request.url).searchParams.get("itemId");

    if (!itemId) {
      return jsonError("Cart item id is required", 400);
    }

    const result = await cartService.removeFromCart(user._id, itemId);

    if (!result.success) {
      return jsonError(result.message, result.status, result.details);
    }

    return respond({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[cart DELETE]", error);
    return handleRouteError(error);
  }
}
