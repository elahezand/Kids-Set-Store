import { z } from "zod";

export const statsTimeseriesSchema = z.object({
    days: z.coerce.number().int().min(1, "days must be at least 1").max(365, "days cannot exceed 365"),
});
