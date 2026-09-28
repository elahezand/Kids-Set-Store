import { z } from "zod";

export const ARTICLE_STATUSES = ["publish", "unpublish"];

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/* ---------- Fields ---------- */

const title = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must be at most 200 characters");

const shortDescription = z
  .string()
  .trim()
  .min(10, "Short description must be at least 10 characters")
  .max(500, "Short description must be at most 500 characters");

const content = z
  .string()
  .trim()
  .min(20, "Content must be at least 20 characters");

const status = z.enum(ARTICLE_STATUSES, {
  message: "Status must be publish or unpublish",
});

// Works with the File object from req.formData() (server) and from <input type="file"> (client)
const cover = z
  .custom(
    (file) => file && typeof file === "object" && "size" in file && "type" in file,
    { message: "Cover image is required" }
  )
  .refine((file) => file.size > 0, "Cover image is required")
  .refine((file) => file.size <= MAX_COVER_SIZE, "Cover must be at most 5MB")
  .refine(
    (file) => COVER_TYPES.includes(file.type),
    "Cover must be JPG, PNG, WEBP or AVIF"
  );

/* ---------- Schemas ---------- */

export const createArticleSchema = z.object({
  title,
  shortDescription,
  content,
  status: status.default("unpublish"),
  cover,
});

// Every field optional, but at least one must be sent
export const updateArticleSchema = z
  .object({
    title,
    shortDescription,
    content,
    status,
    cover,
  })
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Nothing to update"
  );

export const articleListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).catch(9),
  cursor: z.string().trim().min(1).optional().catch(undefined),
  status: status.optional().catch(undefined),
});