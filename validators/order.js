import { z } from "zod";

export const orderSchema = z.object({
  user: z.string().min(1, "User is required"),

  items: z.array(
    z.object({
      product: z.string().min(1, "Product is required"),
      title: z.string().optional(),
      price: z.number().positive(),
      count: z.number().int().min(1),
    })
  ).min(1, "Order must have at least one item"),

  totalPrice: z.number().positive(),

  status: z.enum([
    "pending",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "canceled",
  ]).optional(),

  paymentMethod: z.enum(["online", "cash"]),

  isPaid: z.boolean().optional(),
  paidAt: z.date().optional(),

  shippingAddress: z.object({
    fullName: z.string().min(3),
    phone: z.string().min(8),
    address: z.string().min(5),
    city: z.string().min(2),
    postalCode: z.string().optional(),
  }).optional(),
});
