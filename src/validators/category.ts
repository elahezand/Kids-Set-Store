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

const slug = z
  .string()
  .trim()
  .max(120, "Slug must be at most 120 characters")
  .optional()
  .transform((value) => value || undefined);

const description = z.string().trim().max(300, "Description must be at most 300 characters").optional();

export const createCategorySchema = z.object({
  name,
  slug,
  description,
  parentId: z.preprocess((value) => (value === "" || value === undefined ? null : value), objectId.nullable()),
});

export const updateCategorySchema = z
  .object({
    name: name.optional(),
    slug,
    description,
    parentId: z.preprocess((value) => (value === "" ? null : value), objectId.nullable().optional()),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), "Nothing to update");
