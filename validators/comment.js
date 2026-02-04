import { z } from "zod";

export const commentValidationSchema = z.object({
    username: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(40, "Name cannot exceed 40 characters")
        // Simple regex for English & Persian letters to avoid backtracking issues
        .refine((val) => /^[a-zA-Z\u0600-\u06FF\s]+$/.test(val), "Name must only contain letters"),
    email: z
        .string()
        .email("Invalid email format"),
    score: z
        .number()
        .min(0, "Score cannot be less than 0")
        .max(5, "Maximum score is 5"),

    body: z
        .string()
        .min(5, "Long description must be at least 200 characters"),

});
