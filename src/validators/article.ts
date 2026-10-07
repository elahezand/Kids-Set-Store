import { z } from "zod";
import { dateRangeQuery } from "@/validators/_shared";

const objectId = (message: string) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

const title = z
  .string()
  .trim()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must be at most 200 characters");

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

const category = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  objectId("Invalid category").nullable()
);

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

export const createArticleSchema = z.object({
  ...articleFields,
  isPublished: z.boolean().default(false),
});

export const updateArticleSchema = z
  .object(articleFields)
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), "Nothing to update");

export const articleListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).catch(9),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});

export const adminArticlesQuerySchema = articleListQuerySchema.extend({
  ...dateRangeQuery,
  limit: z.coerce.number().int().min(1).max(50).catch(15),
  q: z.string().trim().max(100).optional(),
  isPublished: z.enum(["true", "false", "all"]).optional().catch(undefined),
});

export const articleFormSchema = createArticleSchema;
