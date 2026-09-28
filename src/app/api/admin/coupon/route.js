import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import {
    adminCouponsQuerySchema,
    createCouponSchema,
} from "../../../../../validators/coupon";
import { authAdmin } from "@/utils/api/authGaurd";
import validate from "@/utils/api/validate";
import couponService from "@/services/api/admin/couponService";
import {
    validationError,
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

/* GET /api/admin/coupons */

export async function GET(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
            );
        }

        const { searchParams } =
            new URL(req.url);

        const query =
            Object.fromEntries(
                searchParams.entries()
            );

        const result = validate(
            adminCouponsQuerySchema,
            query
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await couponService.getCoupons(
                result.data
            );

        return NextResponse.json(
            {
                data: serviceResult.data,
                pagination:
                    serviceResult.pagination,
            },
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/coupons"
        );
    }
}

/* POST /api/admin/coupons */

export async function POST(req) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin) {
            return jsonError(
                "Admin access required",
                401
            );
        }

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
            createCouponSchema,
            body
        );

        if (!result.success) {
            return validationError(
                result.errors
            );
        }

        const serviceResult =
            await couponService.createCoupon(
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
                    "Coupon created successfully",
                data: serviceResult.data,
            },
            { status: 201 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "POST /api/admin/coupons"
        );
    }
}