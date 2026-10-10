import { z } from "zod";
import { dateRangeQuery } from "@/validators/_shared";

const phoneSchema = z
  .string()
  .trim()
  .length(11, "Phone number must be exactly 11 digits")
  .regex(/^09\d{9}$/, "Invalid Iranian phone number format");

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "At least one uppercase letter is required")
  .refine((val) => /[a-z]/.test(val), "At least one lowercase letter is required")
  .refine((val) => /[0-9]/.test(val), "At least one number is required")
  .refine((val) => /[#?!@$%^&*\-]/.test(val), "At least one special character is required");

export const userValidationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(40, "Name cannot exceed 40 characters")
    .refine((val) => /^[a-zA-Z\u0600-\u06FF\s]+$/.test(val), "Name must only contain letters"),

  email: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().toLowerCase().email("Invalid email format").optional()
  ),

  phone: phoneSchema,

  password: strongPasswordSchema,
});

export const resetPasswordSchema = z.object({
  phone: phoneSchema,
  resetCode: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, "Code must be 4 to 6 digits"),
  password: strongPasswordSchema,
});

export const createUserSchema = z.object({
  phone: phoneSchema,
  role: z.array(z.enum(["USER", "ADMIN"])).optional(),
});

export const adminUsersQuerySchema = z.object({
  ...dateRangeQuery,
  role: z.enum(["ADMIN", "USER"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});

export const userUpdateSchema = z.object({
  username: z.string().trim().min(2, "Username is too short").max(40, "Username cannot exceed 40 characters"),
  email: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().toLowerCase().email("Invalid email").optional()
  ),
  phone: phoneSchema,
  phoneCode: z.string().trim().optional(),
});

export const profileValidationSchema = userUpdateSchema
  .extend({
    password: z.string().optional(),
    newPassword: z.preprocess((val) => (val === "" ? undefined : val), strongPasswordSchema.optional()),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const phoneCodeRequestSchema = z.object({
  phone: phoneSchema,
});
