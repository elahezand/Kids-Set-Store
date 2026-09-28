import { NextResponse } from "next/server";
import connectToDB from "../../../../../../configs/db";
import {
    updateCouponSchema,
} from "../../../../../../validators/coupon";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import validateObjectId from "@/utils/api/validateObjectId";
import couponService from "@/services/couponService";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

// Every handler here: admin + valid id

const guard = async (params) => {
    const admin = await authAdmin();

    if (!admin) {
        return {
            error: jsonError(
                "Admin access required",
                401
            ),
        };
    }

    const { id } = await params;

    if (!validateObjectId(id)) {
        return {
            error: jsonError(
                "Coupon not found",
                404
            ),
        };
    }

    return {
        admin,
        id,
    };
};

/* GET /api/admin/coupons/:id */

export async function GET(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const result =
            await couponService.getCouponById(
                id
            );

        if (!result.success) {
            return jsonError(
                result.message,
                result.status
            );
        }

        return NextResponse.json(
            {
                data: result.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/coupons/:id"
        );
    }
}

/* PUT /api/admin/coupons/:id */

export async function PUT(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const body = await req
            .json()
            .catch(() => null);

        if (!body) {
            return jsonError(
                "Invalid JSON body",
                400
            );
        }

        const result = validate(
            updateCouponSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await couponService.updateCoupon(
                id,
                result.data
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json(
            {
                message:
                    "Coupon updated successfully",
                data: serviceResult.data,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "PUT /api/admin/coupons/:id"
        );
    }
}

/* DELETE /api/admin/coupons/:id */

export async function DELETE(req, { params }) {
    try {
        await connectToDB();

        const {
            id,
            error,
        } = await guard(params);

        if (error) return error;

        const serviceResult =
            await couponService.deleteCoupon(
                id
            );

        if (!serviceResult.success) {
            return jsonError(
                serviceResult.message,
                serviceResult.status
            );
        }

        return NextResponse.json(
            {
                message:
                    "Coupon removed successfully",
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "DELETE /api/admin/coupons/:id"
        );
    }
}