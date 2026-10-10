import { z } from "zod";
import { cursorQuerySchema, dateRangeQuery } from "@/validators/_shared";

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
});

export const adminNewsletterQuerySchema = cursorQuerySchema.extend({
  ...dateRangeQuery,
  q: z.string().trim().max(100).optional(),
});
