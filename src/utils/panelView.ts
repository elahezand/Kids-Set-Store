import type { OrderListItem, OrderStatus, PaymentStatus, TicketPriority } from "@/types";

/* labels + badge colors used by the user panel (one place, no copies in components) */

type Badge = { label: string; badge: string };

export const ORDER_STATUS: Record<OrderStatus, Badge> = {
  created: { label: "Placed", badge: "badge-neutral" },
  processing: { label: "Processing", badge: "badge-accent" },
  shipped: { label: "Shipped", badge: "badge-warning" },
  completed: { label: "Delivered", badge: "badge-success" },
  cancelled: { label: "Cancelled", badge: "badge-danger" },
};

export const PAYMENT_STATUS: Record<PaymentStatus, Badge> = {
  pending: { label: "Unpaid", badge: "badge-warning" },
  paid: { label: "Paid", badge: "badge-success" },
  failed: { label: "Failed", badge: "badge-danger" },
  refunded: { label: "Refunded", badge: "badge-neutral" },
};

export const TICKET_PRIORITY: Record<TicketPriority, Badge> = {
  1: { label: "Low", badge: "badge-neutral" },
  2: { label: "Medium", badge: "badge-warning" },
  3: { label: "High", badge: "badge-danger" },
};

export const ticketState = (isAnswer: boolean): Badge =>
  isAnswer ? { label: "Answered", badge: "badge-success" } : { label: "Waiting", badge: "badge-accent" };

/** "#A1B2C3" — last 6 chars of the id */
export const shortId = (id: string) => `#${String(id).slice(-6).toUpperCase()}`;

export const orderItemsCount = (order: Pick<OrderListItem, "items">) =>
  order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ?? 0;

export const DEFAULT_AVATAR =
  "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";
