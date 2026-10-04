import { z } from "zod";

const objectId = (message) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

/* ---------- Fields (same names as model/article) ---------- */

const title = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must be at most 200 characters");

// optional: generated from the title when empty
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(220, "Slug must be at most 220 characters")
  .regex(/^[\p{L}\p{N}-]*$/u, "Only letters, numbers and -")
  .optional()
  .transform((value) => value || undefined);

const excerpt = z
  .string()
  .trim()
  .min(10, "Short description must be at least 10 characters")
  .max(500, "Short description must be at most 500 characters");

// the rich editor always sends HTML: count the visible text only
const content = z
  .string()
  .trim()
  .refine((html) => html.replace(/<[^>]*>/g, "").trim().length >= 20, "Content must be at least 20 characters");

// "" / undefined -> null (no category)
const category = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  objectId("Invalid category").nullable()
);

// a path returned by POST /api/admin/upload (or an absolute URL)
const cover = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z
    .string()
    .trim()
    .max(500)
    .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), "Invalid cover image")
    .nullable()
);

const articleFields = {
  title,
  slug,
  excerpt,
  content,
  category,
  cover,
  isPublished: z.boolean().optional(),
};

/* ---------- Schemas ---------- */

/* POST /api/admin/article  (also the admin article form) */
export const createArticleSchema = z.object({
  ...articleFields,
  isPublished: z.boolean().default(false),
});

/* PUT /api/admin/article/:id — every field optional, but at least one must be sent */
export const updateArticleSchema = z
  .object(articleFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), "Nothing to update");

/* public /articles list */
export const articleListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).catch(9),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});

/* GET /api/admin/article?isPublished=true|false&q=&limit=&cursor= */
export const adminArticlesQuerySchema = articleListQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).catch(15),
  q: z.string().trim().max(100).optional(),
  isPublished: z.enum(["true", "false", "all"]).optional().catch(undefined),
});

/* admin form (client side): same rules as the API */
export const articleFormSchema = createArticleSchema;
