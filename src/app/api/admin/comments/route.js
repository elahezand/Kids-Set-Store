import { NextResponse } from "next/server";
import connectToDB from "../../../../../configs/db";
import { authAdmin } from "@/utils/api/authGaurd";
import commentService from "@/services/api/admin/commentServic";
import {
    jsonError,
    handleRouteError,
} from "@/utils/apiHelpers";

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

        const query = Object.fromEntries(
            searchParams.entries()
        );

        const result =
            await commentService.getAdmin(
                query
            );

        return NextResponse.json(
            result,
            { status: 200 }
        );
    } catch (err) {
        return handleRouteError(
            err,
            "GET /api/admin/comments"
        );
    }
}