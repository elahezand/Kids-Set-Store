import { z } from "zod";

const objectId = (message) => z.string().trim().regex(/^[a-f\d]{24}$/i, message);

const code = z
  .string()
  .trim()
  .min(3, "Code must be at least 3 characters")
  .max(30, "Code must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, - and _")
  .transform((value) => value.toUpperCase());

// "" / null -> null (no limit), string -> Date
const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.date({ message: "Invalid date" }).nullable()
);

const datesInOrder = (data) =>
  !data.startsAt || !data.expiresAt || data.expiresAt > data.startsAt;

const datesError = { message: "Expiry date must be after the start date", path: ["expiresAt"] };

/* ---------- User ---------- */

/* POST /api/discount/use */
export const applyDiscountSchema = z.object({
  code: z.string().trim().min(1, "Enter a discount code"),
});

/* ---------- Admin ---------- */

const discountFields = {
  code,
  percent: z.coerce
    .number({ message: "Percent is required" })
    .int("Percent must be a whole number")
    .min(1, "Percent must be at least 1")
    .max(100, "Percent must be at most 100"),
  product: objectId("Invalid product"),
  maxUses: z.coerce
    .number({ message: "Max uses is required" })
    .int("Max uses must be a whole number")
    .min(1, "Max uses must be at least 1"),
  startsAt: optionalDate,
  expiresAt: optionalDate,
  isActive: z.boolean().optional(),
};

/* POST /api/admin/discounts */
export const createDiscountSchema = z
  .object(discountFields)
  .refine(datesInOrder, datesError);

/* PUT /api/admin/discounts/:id (only sent fields change) */
export const updateDiscountSchema = z
  .object({
    ...discountFields,
    startsAt: optionalDate.optional(),
    expiresAt: optionalDate.optional(),
  })
  .partial()
  .refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    "Nothing to update"
  )
  .refine(datesInOrder, datesError);

/* GET /api/admin/discounts?isActive=true&productId=... */
export const adminDiscountsQuerySchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .optional()
    .catch(undefined)
    .transform((value) => (value === undefined ? undefined : value === "true")),
  productId: objectId("Invalid product").optional().catch(undefined),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});