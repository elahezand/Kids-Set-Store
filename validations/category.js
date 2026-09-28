import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid parent category");

const name = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

// Optional: generated from name when empty
const slug = z
  .string()
  .trim()
  .max(120, "Slug must be at most 120 characters")
  .optional()
  .transform((value) => value || undefined);

/* POST: "" / null / missing parentId -> root category */
export const createCategorySchema = z.object({
  name,
  slug,
  parentId: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    objectId.nullable()
  ),
});

/* PUT: only sent fields change
   parentId: missing = keep, "" / null = move to root, id = move under that category */
export const updateCategorySchema = z
  .object({
    name: name.optional(),
    slug,
    parentId: z.preprocess(
      (value) => (value === "" ? null : value),
      objectId.nullable().optional()
    ),
  })
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Nothing to update"
  );