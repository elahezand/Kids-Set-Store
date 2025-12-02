import { z } from "zod";

export const articleSchema = z.object({
    title: z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name cannot exceed 100 characters"),
    author: z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(20, "Product name cannot exceed 100 characters"),

    shortDescription: z
        .string()
        .min(5, "Short description must be at least 5 characters"),

});
