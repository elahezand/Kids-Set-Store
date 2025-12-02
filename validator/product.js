import { z } from "zod";

export const productSchema = z.object({
    name: z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name cannot exceed 100 characters"),

    price: z
        .number()
        .min(1, "Price must be greater than 0")
        .refine((v) => Number.isFinite(v), "Invalid price value"),
    longDescription: z
        .string()
        .min(20, "Long description must be at least 20 characters"),

    shortDescription: z
        .string()
        .min(5, "Short description must be at least 5 characters"),

    tags: z
        .array(z.string().min(2))
        .max(20, "You can only define up to 20 tags"),

    categoryId: z
        .string()
        .min(1, "Subcategory is not valid"),

    availableSizes:
        z.array(z.string().min(1))
            .max(20, "You can only define up to 20 tags"),


});
