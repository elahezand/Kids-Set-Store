import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import DiscountModel from "../../../../../model/discount";
import { applyDiscountSchema } from "../../../../../validators/discount";
import { getMe } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

/* POST /api/discount/use (logged-in user)*/
export async function POST(req) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in to use a discount code", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = applyDiscountSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const discount = await DiscountModel.findUsable(parsed.data.code, user._id);

    if (!discount) return jsonError("Invalid or expired discount code", 400);

    return NextResponse.json(
      {
        message: "Discount applied!",
        code: discount.code,
        productId: String(discount.product),
        percent: discount.percent,
      },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/discount/use");
  }
}