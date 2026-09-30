import { z } from "zod";

const ORDER_STATUSES = ["created", "processing", "shipped", "completed", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const optionalDate = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.coerce.date({ message: "Invalid date" }).optional()
);

/* GET /api/admin/order */
export const adminOrdersQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(99).optional().catch(undefined),
    cursor: z.string().trim().min(1).optional().catch(undefined),
    status: z.union([z.enum(ORDER_STATUSES), z.literal("all")]).optional().catch(undefined),
    paymentStatus: z.union([z.enum(PAYMENT_STATUSES), z.literal("all")]).optional().catch(undefined),
    user: z.string().optional(),
    q: z.string().trim().max(100).optional(),
    preset: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .passthrough();

/* PUT /api/admin/order/:id — only fields the service lets an admin change */
export const updateAdminOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    isDelivered: z.boolean().optional(),
    deliveredAt: optionalDate,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), "Nothing to update");

/* POST /api/admin/order/:id/ship */
export const adminShipItemSchema = z.object({
  trackingCode: z.string().trim().min(3, "Tracking code is required").max(60),
  estimatedDeliveryAt: optionalDate,
});

/* PUT /api/admin/order/:id/delivery */
export const deliveryEstimateSchema = z.object({
  estimatedDeliveryAt: z.coerce.date({ message: "Estimated delivery date is required" }),
});
