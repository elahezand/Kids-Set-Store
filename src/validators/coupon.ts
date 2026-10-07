import { z } from "zod";
import { dateRangeQuery } from "@/validators/_shared";

const code = z
  .string()
  .trim()
  .min(3, "Code must be at least 3 characters")
  .max(30, "Code must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, - and _")
  .transform((value) => value.toUpperCase());

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.date({ message: "Invalid date" }).nullable()
);

const optionalNumber = (label: string) =>
  z.preprocess(
    (v) => (v === "" || v === undefined || v === null || Number.isNaN(v) ? null : v),
    z.coerce.number({ message: `${label} must be a number` }).min(0, `${label} can't be negative`).nullable()
  );

const datesInOrder = (data: { startsAt?: Date | null; expiresAt?: Date | null }) =>
  !data.startsAt || !data.expiresAt || data.expiresAt > data.startsAt;
const datesError = { message: "Expiry date must be after the start date", path: ["expiresAt"] };

const couponFields = {
  code,
  type: z.enum(["fixed", "percent"], { message: "Type must be fixed or percent" }),
  amount: z.coerce.number({ message: "Amount is required" }).min(0, "Amount can't be negative"),
  maxDiscount: optionalNumber("Max discount"),
  usageLimit: optionalNumber("Usage limit"),
  startsAt: optionalDate,
  expiresAt: optionalDate,
  isActive: z.boolean().optional(),
};

const percentInRange = (d: { type?: string; amount?: number }) => d.type !== "percent" || d.amount === undefined || d.amount <= 100;
const percentError = { message: "A percent coupon can't exceed 100", path: ["amount"] };

export const createCouponSchema = z
  .object(couponFields)
  .refine(datesInOrder, datesError)
  .refine(percentInRange, percentError);

export const updateCouponSchema = z
  .object(couponFields)
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), "Nothing to update")
  .refine(datesInOrder, datesError);

export const adminCouponsQuerySchema = z.object({
  ...dateRangeQuery,
  search: z.string().trim().max(60).optional(),
  q: z.string().trim().max(60).optional(),
  type: z.enum(["fixed", "percent"]).optional().catch(undefined),
  isActive: z.enum(["true", "false", "all"]).optional().catch(undefined),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});
