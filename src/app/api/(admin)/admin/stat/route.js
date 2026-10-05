import connectToDB from "@/configs/db";

import { authAdmin } from "@/utils/auth/authGuard";
import validate from "@/utils/validate";

import statsService from "@/services/server/admin/stats";

import { fromService, handleRouteError, jsonError, validationError } from "@/utils/apiResponse";

import { statsTimeseriesSchema } from "@/validators/stats";

export async function GET(request) {
    try {
        await connectToDB();

        const admin = await authAdmin();

        if (!admin || admin.status === "expired") {
            return jsonError("Unauthorized", 401);
        }

        const { searchParams } = new URL(request.url);

        const days = searchParams.get("days");

        if (days !== null) {
            const result = validate(statsTimeseriesSchema, { days });

            if (!result.success) {
                return validationError(result.errors);
            }

            return fromService(await statsService.getStatsTimeseries(result.data.days));
        }

        return fromService(await statsService.getDashboard());
    } catch (error) {
        return handleRouteError(error);
    }
}
