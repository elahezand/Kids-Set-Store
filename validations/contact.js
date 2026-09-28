import { z } from "zod";

export const contactValidationSchema = z.object({
    name: z
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

    company: z
        .string()
        .min(5, "Long description must be at least 200 characters")
        .max(20, "Long description must be at least 200 characters"),

    body: z
        .string()
        .min(5, "Long description must be at least 200 characters"),

});
