import { z } from "zod";

export const createNotificationSchema = z.object({
    user: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id"),
    msg: z
        .string()
        .trim()
        .min(3, "Message must be at least 3 characters")
        .max(500, "Message cannot exceed 500 characters"),
    link: z.string().trim().max(300).nullable().optional(),
});
