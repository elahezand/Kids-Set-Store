import type {
  AdminCommentStatusFilter,
  ArticleStatusFilter,
  CommentStatus,
  CommentStatusFilter,
  Coupon,
  CouponStatusFilter,
  OrderListItem,
  OrderStatus,
  OrderStatusFilter,
  PaymentStatus,
  ProductStatus,
  ProductStatusFilter,
  TicketPriority,
  TicketStatusFilter,
  UserRoleFilter,
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

export const COMMENT_STATUS: Record<CommentStatus, Badge> = {
  approved: { label: "Approved", badge: "badge-success" },
  pending: { label: "Pending", badge: "badge-warning" },
  rejected: { label: "Rejected", badge: "badge-danger" },
  spam: { label: "Spam", badge: "badge-danger" },
  deleted: { label: "Deleted", badge: "badge-neutral" },
};

export const PRODUCT_STATUS: Record<ProductStatus, Badge> = {
  active: { label: "Active", badge: "badge-success" },
  draft: { label: "Draft", badge: "badge-warning" },
  inactive: { label: "Hidden", badge: "badge-neutral" },
};

export const productState = (status: string): Badge =>
  PRODUCT_STATUS[status as ProductStatus] ?? { label: status || "Unknown", badge: "badge-neutral" };

export const articleState = (isPublished: boolean): Badge =>
  isPublished ? { label: "Published", badge: "badge-success" } : { label: "Draft", badge: "badge-warning" };

export const couponState = (
  coupon: Pick<Coupon, "isActive" | "expiresAt" | "startsAt" | "usageLimit" | "usedCount">
): Badge => {
  const now = Date.now();
  if (!coupon.isActive) return { label: "Disabled", badge: "badge-neutral" };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= now)
    return { label: "Expired", badge: "badge-danger" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    return { label: "Used up", badge: "badge-neutral" };
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now)
    return { label: "Scheduled", badge: "badge-accent" };
  return { label: "Active", badge: "badge-success" };
};

/* same rules as services/server/admin/order.js (the server checks them again) */
export const ORDER_STATUS_MOVES: Record<OrderStatus, OrderStatus[]> = {
  created: ["cancelled"],
  processing: ["cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
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

export const ADMIN_COMMENT_TABS: ReadonlyArray<Tab<AdminCommentStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
];

export const PRODUCT_TABS: ReadonlyArray<Tab<ProductStatusFilter>> = [
  { value: "all", label: "All" },
  ...(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((value) => ({ value, label: PRODUCT_STATUS[value].label })),
];

export const USER_ROLE_TABS: ReadonlyArray<Tab<UserRoleFilter>> = [
  { value: "all", label: "All" },
  { value: "USER", label: "Customers" },
  { value: "ADMIN", label: "Admins" },
];

export const ARTICLE_TABS: ReadonlyArray<Tab<ArticleStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export const COUPON_TABS: ReadonlyArray<Tab<CouponStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "active", label: "Enabled" },
  { value: "inactive", label: "Disabled" },
];

/** name to show for a populated user ref (or a bare id) */
export const personName = (user: { username?: string; phone?: string } | string | null | undefined, fallback = "—") =>
  user && typeof user === "object" ? user.username || user.phone || fallback : fallback;
