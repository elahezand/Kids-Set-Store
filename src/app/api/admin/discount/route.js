import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import DiscountModel from "../../../../../model/discount";
import ProductModel from "../../../../../model/product";
import {
  createDiscountSchema,
  adminDiscountsQuerySchema,
} from "../../../../../validators/discount";
import { authAdmin } from "@/utils/serverHelper";
import { paginate } from "@/utils/paginate";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

/* GET /api/admin/discounts?isActive=true&productId=...&cursor=... */
export async function GET(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const { searchParams } = new URL(req.url);
    const { isActive, productId, limit, cursor } = adminDiscountsQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const result = await paginate(DiscountModel, {
      limit,
      cursor: cursor ?? null,
      filters: {
        ...(isActive !== undefined && { isActive }),
        ...(productId && { product: productId }),
      },
      sort: { _id: -1 },
    });

    const data = await DiscountModel.populate(result.data || [], [
      { path: "product", select: "name img price" },
      { path: "creator", select: "name username" },
    ]);

    const list = data.map((item) => {
      const { usedBy, ...discount } =
        typeof item.toObject === "function" ? item.toObject() : item;
      return discount;
    });

    return NextResponse.json({ data: list, pagination: result.pagination }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/discounts");
  }
}

/* POST /api/admin/discounts */
export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createDiscountSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;

    if (!(await ProductModel.exists({ _id: data.product }))) {
      return jsonError("Product not found", 404);
    }

    if (await DiscountModel.exists({ code: data.code })) {
      return jsonError("This discount code already exists", 409);
    }

    const discount = await DiscountModel.create({ ...data, creator: admin._id });

    return NextResponse.json(
      { message: "Discount created successfully", data: discount },
      { status: 201 }
    );
  } catch (err) {
    if (err?.code === 11000) return jsonError("This discount code already exists", 409);
    return handleRouteError(err, "POST /api/admin/discounts");
  }
}