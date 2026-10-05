import { z } from "zod";

const ORDER_STATUSES = ["created", "processing", "shipped", "completed", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const optionalDate = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.coerce.date({ message: "Invalid date" }).optional()
);

export const adminOrdersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(99).optional().catch(undefined),
    cursor: z.string().trim().min(1).optional().catch(undefined),
    status: z
      .union([z.enum(ORDER_STATUSES), z.literal("all")])
      .optional()
      .catch(undefined),
    paymentStatus: z
      .union([z.enum(PAYMENT_STATUSES), z.literal("all")])
      .optional()
      .catch(undefined),
    user: z.string().optional(),
    q: z.string().trim().max(100).optional(),
    preset: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .passthrough();

export const updateAdminOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    isDelivered: z.boolean().optional(),
    deliveredAt: optionalDate,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), "Nothing to update");

export const adminShipOrderSchema = z.object({
  trackingCode: z.string().trim().min(3, "Tracking code is required").max(60),
  estimatedDeliveryAt: optionalDate,
});

export const deliveryEstimateSchema = z.object({
  estimatedDeliveryAt: z.coerce.date({ message: "Estimated delivery date is required" }),
});

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "Enter a valid phone number (09xxxxxxxxx)"),
  state: z.string().trim().min(2, "State is required").max(60),
  city: z.string().trim().min(2, "City is required").max(60),
  address: z.string().trim().min(5, "Address is required").max(300),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5,10}$/, "Postal code must be 5-10 digits"),
});

export const checkoutFormSchema = shippingAddressSchema.extend({
  paymentMethod: z.enum(["zarinpal", "cash"]),
  useWallet: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["zarinpal", "cash", "wallet"]),
  idempotencyKey: z.string().trim().min(8).max(100).optional(),
  useWallet: z.boolean().optional(),
});
