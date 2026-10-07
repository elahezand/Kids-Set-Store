import { z } from "zod";
import { dateRangeQuery } from "@/validators/_shared";

const objectId = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, message);

const textList = z
  .array(z.string().trim().max(200, "Each item must be at most 200 characters"))
  .max(10, "At most 10 items")
  .optional();

const limit = (fallback: number) => z.coerce.number().int().min(1).max(50).catch(fallback);
const cursor = z.string().trim().min(1).optional().catch(undefined);

export const createCommentSchema = z.object({
  productId: objectId("Invalid product"),

  rating: z.coerce
    .number({ message: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Please choose a rating")
    .max(5, "Rating must be at most 5"),

  body: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(2000, "Comment must be at most 2000 characters"),

  pros: textList,
  cons: textList,

  recommendation: z.enum(["recommended", "not_recommended", "no_idea"]).optional(),
});

export const adminCommentsQuerySchema = z.object({
  ...dateRangeQuery,
  status: z.enum(["pending", "approved", "rejected", "spam", "deleted"]).optional().catch(undefined),
  productId: objectId("Invalid product").optional().catch(undefined),
  userId: objectId("Invalid user").optional().catch(undefined),
  replied: z.enum(["true"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional(),
  limit: limit(20),
  cursor,
});

export const moderateCommentSchema = z
  .object({
    status: z.enum(["approved", "rejected", "spam", "deleted"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((data) => ["approved", "spam"].includes(data.status) || Boolean(data.reason), {
    message: "A reason is required",
    path: ["reason"],
  });

export const deleteCommentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const replyCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Reply must be at least 2 characters")
    .max(2000, "Reply must be at most 2000 characters"),
});

export const commentValidationSchema = createCommentSchema.omit({ productId: true });