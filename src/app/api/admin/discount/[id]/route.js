import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../../configs/db";
import DiscountModel from "../../../../../../model/discount";
import ProductModel from "../../../../../../model/product";
import { updateDiscountSchema } from "../../../../../../validators/discount";
import { authAdmin } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

// Every handler here: admin + valid id
const guard = async (params) => {
    const admin = await authAdmin();
    if (!admin) return { error: jsonError("Admin access required", 401) };

    const { id } = await params;
    if (!isValidObjectId(id)) return { error: jsonError("Discount not found", 404) };

    return { admin, id };
};

/* PUT /api/admin/discounts/:id*/
export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const { id, error } = await guard(params);
        if (error) return error;

        const body = await req.json().catch(() => null);
        if (!body) return jsonError("Invalid JSON body", 400);

        const parsed = updateDiscountSchema.safeParse(body);
        if (!parsed.success) return validationError(parsed.error);

        const data = parsed.data;

        const discount = await DiscountModel.findById(id);
        if (!discount) return jsonError("Discount not found", 404);

        if (data.product && !(await ProductModel.exists({ _id: data.product }))) {
            return jsonError("Product not found", 404);
        }

        if (data.code && data.code !== discount.code) {
            if (await DiscountModel.exists({ _id: { $ne: id }, code: data.code })) {
                return jsonError("This discount code already exists", 409);
            }
        }

        if (data.maxUses !== undefined && data.maxUses < discount.uses) {
            return jsonError(`This code has already been used ${discount.uses} times`, 409);
        }

        const startsAt = data.startsAt !== undefined ? data.startsAt : discount.startsAt;
        const expiresAt = data.expiresAt !== undefined ? data.expiresAt : discount.expiresAt;
        if (startsAt && expiresAt && expiresAt <= startsAt) {
            return jsonError("Expiry date must be after the start date", 400);
        }

        Object.assign(discount, data);
        await discount.save();

        return NextResponse.json(
            { message: "Discount updated successfully", data: discount },
            { status: 200 }
        );
    } catch (err) {
        if (err?.code === 11000) return jsonError("This discount code already exists", 409);
        return handleRouteError(err, "PUT /api/admin/discounts/:id");
    }
}

/* DELETE /api/admin/discounts/:id */
export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const { id, error } = await guard(params);
        if (error) return error;

        const discount = await DiscountModel.findById(id).select("uses").lean();
        if (!discount) return jsonError("Discount not found", 404);

        if (discount.uses > 0) {
            return jsonError(
                `This code has been used ${discount.uses} times. Deactivate it instead of deleting.`,
                409
            );
        }

        await DiscountModel.findByIdAndDelete(id);

        return NextResponse.json({ message: "Discount removed successfully" }, { status: 200 });
    } catch (err) {
        return handleRouteError(err, "DELETE /api/admin/discounts/:id");
    }
}