import { z } from "zod";
import { cursorQuerySchema } from "./_shared";

export const newsletterSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email format"),
});

export const adminNewsletterQuerySchema = cursorQuerySchema;
