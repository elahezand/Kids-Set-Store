import { z } from "zod";

const objectId = (message) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

const PRODUCT_STATUSES = ["draft", "active", "inactive"];

const variantSchema = z.object({
  attributes: z.record(z.string(), z.string()).refine((a) => Object.keys(a).length > 0, "Variant needs at least one attribute"),
  sku: z.string().trim().min(1, "SKU is required"),
  price: z.coerce.number({ message: "Variant price is required" }).min(0),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
});

const productFields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(3000),
  categoryPath: z.array(objectId("Invalid category")).default([]),
  images: z.array(z.string()).max(10, "At most 10 images").optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  tags: z.array(z.string().trim().min(1)).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  shipping: z
    .object({
      type: z.enum(["standard", "express", "free"]).default("standard"),
      cost: z.coerce.number().min(0).default(0),
    })
    .optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
};

/* POST /api/admin/products */
export const createProductSchema = z.object(productFields);

/* Flat admin form (add / edit). buildProductPayload() turns it into createProductSchema's shape. */
const csv = z.preprocess(
  (v) => (Array.isArray(v) ? v : String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean)),
  z.array(z.string())
);

export const productFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(3000),
  price: z.coerce.number({ message: "Price is required" }).min(0, "Price can't be negative"),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  sizes: csv.optional().default([]),
  color: z.string().trim().max(40).optional().default(""),
  material: z.string().trim().max(60).optional().default(""),
  tags: csv.optional().default([]),
  categoryPath: z.array(objectId("Invalid category")).default([]),
  status: z.enum(PRODUCT_STATUSES).optional().default("active"),
});

/* PUT /api/admin/products/:id (only sent fields change) */
export const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), "Nothing to update");

/* PATCH /api/admin/products/:id — status only */
export const changeProductStatusSchema = z.object({
  status: z.enum(PRODUCT_STATUSES, { message: "Status must be draft, active or inactive" }),
});

/* GET /api/admin/products — filters are validated loosely, buildProductFilters sanitises them */
export const adminProductsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(99).optional().catch(undefined),
    cursor: z.string().trim().min(1).optional().catch(undefined),
    status: z.string().optional(),
    q: z.string().trim().max(100).optional(),
    sku: z.string().trim().max(60).optional(),
    category: z.string().optional(),
    categoryId: z.string().optional(),
    price: z.string().optional(),
    tags: z.string().optional(),
    rating: z.string().optional(),
    hasPhoto: z.string().optional(),
    filter: z.string().optional(),
  })
  .passthrough();

/* POST /api/products/smart-search */
export const smartSearchSchema = z.object({
  prompt: z.string().trim().min(3, "Tell us what you are looking for").max(500),
  budget: z.coerce.number().positive("Budget must be positive").optional(),
});
