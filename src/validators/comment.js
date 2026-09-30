import { z } from "zod";

const objectId = (message) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

const textList = z
  .array(z.string().trim().max(200, "Each item must be at most 200 characters"))
  .max(10, "At most 10 items")
  .optional();

const limit = (fallback) => z.coerce.number().int().min(1).max(50).catch(fallback);
const cursor = z.string().trim().min(1).optional().catch(undefined);

/* ---------- User ---------- */

/* POST /api/comment: review by a logged-in user */
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

/* PUT /api/comment/:id: owner edits their own pending review */
export const updateOwnCommentSchema = createCommentSchema
  .omit({ productId: true })
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Nothing to update"
  );

/* GET /api/comment?productId=... */
export const commentListQuerySchema = z.object({
  productId: objectId("Invalid product"),
  limit: limit(10),
  cursor,
});

/* GET /api/comment/me */
export const myCommentsQuerySchema = z.object({
  limit: limit(10),
  cursor,
});

/* ---------- Admin ---------- */

/* GET /api/admin/comments?status=&productId=&userId= */
export const adminCommentsQuerySchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "spam", "deleted"])
    .optional()
    .catch(undefined),
  productId: objectId("Invalid product").optional().catch(undefined),
  userId: objectId("Invalid user").optional().catch(undefined),
  limit: limit(20),
  cursor,
});

/* PUT /api/admin/comments/:id: reason required for rejected / deleted */
export const moderateCommentSchema = z
  .object({
    status: z.enum(["approved", "rejected", "spam", "deleted"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => ["approved", "spam"].includes(data.status) || Boolean(data.reason),
    { message: "A reason is required", path: ["reason"] }
  );

/* POST /api/admin/comments/:id: reply to a review */
export const replyCommentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Reply must be at least 2 characters")
    .max(2000, "Reply must be at most 2000 characters"),
});

/* client-side form on the product page (rating + text; the author is the logged-in user) */
export const commentValidationSchema = z.object({
  body: z.string().trim().min(3, "Comment must be at least 3 characters").max(2000),
  score: z.coerce.number().int().min(1, "Please choose a rating").max(5),
});
