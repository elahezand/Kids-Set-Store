import { timingSafeEqual } from "node:crypto";
import connectToDB from "@/configs/db";
import { runOrderSweeps } from "@/services/server/shared/orderSweeper";
import { handleRouteError, jsonError, respond } from "@/utils/apiResponse";

export const dynamic = "force-dynamic";

const isAuthorized = (request) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);

  return received.length === expected.length && timingSafeEqual(received, expected);
};

const run = async (request) => {
  try {
    if (!process.env.CRON_SECRET) {
      return jsonError("CRON_SECRET is not configured", 503);
    }

    if (!isAuthorized(request)) {
      return jsonError("Unauthorized", 401);
    }

    await connectToDB();
    const result = await runOrderSweeps();

    return respond({ message: "Order sweeps finished", data: result });
  } catch (error) {
    return handleRouteError(error, "GET /api/cron/orders");
  }
};

export const GET = run;
export const POST = run;
