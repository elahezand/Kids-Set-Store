import { z } from "zod";
import { cursorQuerySchema, dateRangeQuery } from "@/validators/_shared";

export const adminCartsQuerySchema = cursorQuerySchema.extend({
    ...dateRangeQuery,
    status: z.enum(["active", "abandoned", "converted"]).optional().catch(undefined),
});
