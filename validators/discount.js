import { z } from "zod";

export const discountSchema = z.object({
  productID: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID format"), // Validates MongoDB ObjectId

  code: z
    .string()
    .min(3, "Discount code must be at least 3 characters")
    .max(20, "Discount code cannot exceed 20 characters")
    .trim()
    .toUpperCase(), // Usually, discount codes are uppercase

  percent: z
    .number({ invalid_type_error: "Percentage must be a number" })
    .min(1, "Minimum discount is 1%")
    .max(100, "Maximum discount is 100%"),

  maxUses: z
    .number()
    .int("Max uses must be an integer")
    .min(1, "At least 1 use is required"),

  uses: z
    .number()
    .int()
    .min(0)
    .default(0)
    .optional(),

  expTime: z
    .string()
    .or(z.date())
    .refine((val) => new Date(val) > new Date(), {
      message: "Expiration time cannot be in the past",
    }),
});