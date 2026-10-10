import { z } from "zod";

export const cursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

export const dateRangeQuery = {
  preset: z.enum(["all", "today", "7d", "30d", "90d"]).optional().catch(undefined),
  from: day,
  to: day,
};
