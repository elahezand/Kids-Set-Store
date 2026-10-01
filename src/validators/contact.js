import { z } from "zod";

/* Same fields as model/contact.js (name, email, phone, body) */
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

    // Iranian phone number validation with fixed length
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

/* public POST /api/contacts — same fields as the contact form */
export const contactSchema = contactValidationSchema;

/* GET /api/admin/contacts */
export const adminContactsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().catch(undefined),
  cursor: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(["pending", "answered"]).optional().catch(undefined),
});

/* POST /api/admin/contacts/:id — send the answer */
export const answerContactSchema = z.object({
  answer: z.string().trim().min(3, "Answer must be at least 3 characters").max(3000),
});

/* PUT /api/admin/contacts/:id */
export const updateContactSchema = z
  .object({
    status: z.enum(["pending", "answered"]).optional(),
    answer: z.string().trim().min(3).max(3000).optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), "Nothing to update");
