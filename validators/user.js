import { z } from "zod";

export const userValidationSchema = z.object({
  // Use built-in length constraints to reduce Regex complexity
  username: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(40, "Name cannot exceed 40 characters")
    // Simple regex for English & Persian letters to avoid backtracking issues
    .refine((val) => /^[a-zA-Z\u0600-\u06FF\s]+$/.test(val), "Name must only contain letters"),

  // Use Zod's built-in email validator (Optimized & Secure against ReDoS)
  email: z
    .string()
    .email("Invalid email format"),

  // Iranian phone number validation with fixed length
  phone: z
    .string()
    .length(11, "Phone number must be exactly 11 digits")
    .regex(/^09\d{9}$/, "Invalid Iranian phone number format"),

  // Password validation split into atomic steps
  // This approach is more secure than a single complex Regex and provides better UX
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((val) => /[A-Z]/.test(val), "At least one uppercase letter is required")
    .refine((val) => /[a-z]/.test(val), "At least one lowercase letter is required")
    .refine((val) => /[0-9]/.test(val), "At least one number is required")
    .refine((val) => /[#?!@$%^&*\-]/.test(val), "At least one special character is required"),
});