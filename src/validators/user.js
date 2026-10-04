import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .length(11, "Phone number must be exactly 11 digits")
  .regex(/^09\d{9}$/, "Invalid Iranian phone number format");

// Password validation split into atomic steps (better messages, no heavy regex)
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "At least one uppercase letter is required")
  .refine((val) => /[a-z]/.test(val), "At least one lowercase letter is required")
  .refine((val) => /[0-9]/.test(val), "At least one number is required")
  .refine((val) => /[#?!@$%^&*\-]/.test(val), "At least one special character is required");

/* POST /api/auth/signup  (also used by the register form) */
export const userValidationSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(40, "Name cannot exceed 40 characters")
    // Simple regex for English & Persian letters to avoid backtracking issues
    .refine((val) => /^[a-zA-Z\u0600-\u06FF\s]+$/.test(val), "Name must only contain letters"),

  // optional: an empty input is turned into undefined
  email: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().toLowerCase().email("Invalid email format").optional()
  ),

  phone: phoneSchema,

  password: strongPasswordSchema,
});

/* POST /api/reset-password  (forgot password page) */
export const resetPasswordSchema = z.object({
  phone: phoneSchema,
  resetCode: z.string().trim().regex(/^\d{4,6}$/, "Code must be 4 to 6 digits"),
  password: strongPasswordSchema,
});

/* POST /api/admin/users — admin adds a user by phone (they sign in with an SMS code) */
export const createUserSchema = z.object({
  phone: phoneSchema,
  role: z.array(z.enum(["USER", "ADMIN"])).optional(),
});

/* GET /api/admin/users?role=ADMIN|USER&q=&limit=&cursor= */
export const adminUsersQuerySchema = z.object({
  role: z.enum(["ADMIN", "USER"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});

// Admin "edit user" modal — basic contact details only
export const userUpdateSchema = z.object({
  username: z.string().min(2, "Username is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
});

// Profile / account details form (panels) — password fields are optional
export const profileValidationSchema = userUpdateSchema
  .extend({
    password: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, "Password must be at least 8 characters"),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.newPassword || !!data.password, {
    message: "Enter your current password",
    path: ["password"],
  });
