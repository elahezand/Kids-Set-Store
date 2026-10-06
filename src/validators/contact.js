import { z } from "zod";

export const contactValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(40, "Name cannot exceed 40 characters")
        // Simple regex for English & Persian letters to avoid backtracking issues
        .refine((val) => /^[a-zA-Z\u0600-\u06FF\s]+$/.test(val), "Name must only contain letters"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    phone: z
        .string()
        .trim()
        .length(11, "Phone number must be exactly 11 digits")
        .regex(/^09\d{9}$/, "Invalid Iranian phone number format"),

    body: z
        .string()
        .trim()
        .min(5, "Message must be at least 5 characters")
        .max(2000, "Message must be at most 2000 characters"),
});

export const contactSchema = contactValidationSchema;

export const adminContactsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().catch(undefined),
  cursor: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["pending", "answered"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
});

export const answerContactSchema = z.object({
  answer: z.string().trim().min(3, "Answer must be at least 3 characters").max(3000),
});

export const updateContactSchema = z
  .object({
    status: z.enum(["pending", "answered"]).optional(),
    answer: z.string().trim().min(3).max(3000).optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), "Nothing to update");
