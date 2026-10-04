import { z } from "zod";

const objectId = (message) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

const PRODUCT_STATUSES = ["draft", "active", "inactive"];

/* Variant attributes the shop filters on (same slugs as the category filters: filterSection on /products). */
export const VARIANT_FILTER_SLUGS = ["size", "color"];

/* These attributes must use one of the options of the product's category filter (e.g. baby sizes);
   the other variant attributes (color) are free text — the category options are only suggestions. */
export const CATEGORY_LOCKED_ATTRIBUTES = ["size"];

const variantSchema = z.object({
  // sent back on edit so the variant keeps its id (carts / orders point to it)
  _id: objectId("Invalid variant").optional(),
  attributes: z.record(z.string(), z.string()).refine((a) => Object.keys(a).length > 0, "Variant needs at least one attribute"),
  sku: z.string().trim().min(1, "SKU is required"),
  price: z.coerce.number({ message: "Variant price is required" }).min(0),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  // sent by the admin form; the model recomputes it from price & discount (utils/pricing calcFinalPrice)
  finalPrice: z.coerce.number().min(0).optional(),
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

/* ---------- admin product form (client side) ----------
   Every variant is size + color. Sizes come from the category's "size" filter when it has one,
   colors are free text. Specs are the category's other filters (its own + its parents').
   utils/productForm buildProductPayload() turns it into createProductSchema's shape. */

const csv = z.preprocess(
  (v) => (Array.isArray(v) ? v : String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean)),
  z.array(z.string())
);

const money = (label) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number({ message: `${label} is required` }).min(0, `${label} can't be negative`)
  );

export const productFormSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
    description: z.string().trim().min(10, "Description must be at least 10 characters").max(3000),
    status: z.enum(PRODUCT_STATUSES).default("draft"),
    tags: csv.default([]),
    // comma lists, only used by the "Generate variants" button
    sizes: z.string().optional(),
    colors: z.string().optional(),
    variants: z
      .array(
        z.object({
          _id: z.string().optional(),
          size: z.string().trim().min(1, "Choose a size").max(50),
          color: z.string().trim().min(1, "Enter a color").max(50),
          sku: z.string().trim().max(60).optional(),
          price: money("Price"),
          discount: z.preprocess((v) => (v === "" ? 0 : v), z.coerce.number().min(0, "0-100").max(100, "0-100")).default(0),
          // typed by the admin or calculated; the discount is derived from it (the payload recalculates it)
          finalPrice: z.preprocess(
            (v) => (v === "" || v === null || v === undefined ? undefined : v),
            z.coerce.number({ message: "Must be a number" }).min(0, "Can't be negative").optional()
          ),
          stock: z.preprocess((v) => (v === "" ? 0 : v), z.coerce.number().int("Whole number").min(0, "Can't be negative")).default(0),
        })
      )
      .min(1, "Generate the variants first (sizes × colors)")
      .max(100, "At most 100 variants"),
    // { [filter slug]: value } — the fields are the category's filters
    specs: z
      .record(
        z.string(),
        z.preprocess((v) => (v === undefined || v === null || v === false ? "" : v === true ? "true" : v), z.string())
      )
      .default({}),
  })
  .superRefine((data, ctx) => {
    const seen = new Set();
    const skus = new Set();
    data.variants.forEach((variant, i) => {
      const key = `${variant.size.toLowerCase()}|${variant.color.toLowerCase()}`;
      if (seen.has(key)) ctx.addIssue({ code: "custom", message: "Same size & color as another variant", path: ["variants", i, "color"] });
      seen.add(key);

      if (variant.finalPrice !== undefined && variant.finalPrice > variant.price) {
        ctx.addIssue({ code: "custom", message: "Can't be more than the price", path: ["variants", i, "finalPrice"] });
      }

      const sku = variant.sku?.trim().toUpperCase();
      if (sku && skus.has(sku)) ctx.addIssue({ code: "custom", message: "SKU already used", path: ["variants", i, "sku"] });
      if (sku) skus.add(sku);
    });
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
