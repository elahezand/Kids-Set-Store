import { z } from "zod";

const optionalUrl = z.string().trim().max(300).optional().default("");

export const infoSchema = z.object({
    phone: z.string().trim().min(5, "Phone is required").max(20),
    email: z.string().trim().toLowerCase().email("Invalid email format"),
    logo: z.string().trim().min(1, "Logo is required"),
    address: z.string().trim().max(300).optional().default(""),
    socials: z
        .object({
            instagram: optionalUrl,
            telegram: optionalUrl,
            linkedin: optionalUrl,
        })
        .optional()
        .default({ instagram: "", telegram: "", linkedin: "" }),
});
