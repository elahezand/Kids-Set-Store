import { z } from "zod";

const title = z
  .string()
  .trim()
  .min(2, "Title must be at least 2 characters")
  .max(80, "Title must be at most 80 characters");

const description = z
  .string()
  .trim()
  .max(300, "Description must be at most 300 characters")
  .optional()
  .transform((value) => (value === "" ? null : value));

export const createDepartmentSchema = z.object({
  title,
  description,
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Nothing to update"
  );

const subTitle = z
  .string()
  .trim()
  .min(2, "Title must be at least 2 characters")
  .max(80, "Title must be at most 80 characters");

export const createSubDepartmentSchema = z.object({
  department: z.string().regex(/^[a-f\d]{24}$/i, "Invalid department"),
  title: subTitle,
});

export const updateSubDepartmentSchema = z.object({
  title: subTitle,
});
