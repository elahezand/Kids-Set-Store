import type {
  CommentStatusFilter,
  OrderListItem,
  OrderStatus,
  OrderStatusFilter,
  PaymentStatus,
  TicketPriority,
  TicketStatusFilter,
} from "@/types";

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

export const shortId = (id: string) => `#${String(id).slice(-6).toUpperCase()}`;

export const orderItemsCount = (order: Pick<OrderListItem, "items">) =>
  order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ?? 0;

type Tab<T> = { value: T; label: string };

export const TICKET_TABS: ReadonlyArray<Tab<TicketStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "answered", label: "Answered" },
];

export const COMMENT_TABS: ReadonlyArray<Tab<CommentStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export const ORDER_TABS: ReadonlyArray<Tab<OrderStatusFilter>> = [
  { value: "all", label: "All" },
  ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((value) => ({ value, label: ORDER_STATUS[value].label })),
];

export const tabValues = <T>(tabs: ReadonlyArray<Tab<T>>): T[] => tabs.map((tab) => tab.value);
