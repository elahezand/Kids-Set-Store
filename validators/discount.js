import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const discountValidationSchema = z.object({
  product: objectId,

  code: z
    .string()
    .trim()
    .min(3, "Discount code must be at least 3 characters")
    .max(50, "Discount code is too long")
    .transform(val => val.toUpperCase()),

  percent: z.coerce
    .number({ invalid_type_error: "Percent must be a number" })
    .min(0, "Percent cannot be negative")
    .max(100, "Percent cannot exceed 100"),

  max: z.coerce
    .number()
    .int("Max usage must be an integer")
    .min(1, "Max usage must be at least 1"),

  creator: objectId,

  uses: z.coerce.number().int().min(0).default(0).optional(),
  usedBy: z.array(objectId).default([]).optional(),
}).strict(); 

const updateOffSchema = discountCreateSchema
  .omit({ uses: true, usedBy: true, creator: true }) 
  .partial()
  .strict();

export  {
  discountValidationSchema,
  updateOffSchema,
};