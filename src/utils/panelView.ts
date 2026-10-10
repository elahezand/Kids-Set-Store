import type {
  AdminCartStatus,
  AdminCartStatusFilter,
  AdminCommentStatusFilter,
  ContactStatusFilter,
  AdminOrderStatusFilter,
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
  processing: { label: "Processing", badge: "badge-new" },
  shipped: { label: "Shipped", badge: "badge-warning" },
  completed: { label: "Completed", badge: "badge-success" },
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

export const ORDER_STATUS_MOVES: Record<OrderStatus, OrderStatus[]> = {
  created: ["cancelled"],
  processing: ["cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

export const paymentState = (order: Pick<OrderListItem, "status" | "paymentStatus">): Badge =>
  order.status === "cancelled" && order.paymentStatus === "pending"
    ? PAYMENT_STATUS.failed
    : (PAYMENT_STATUS[order.paymentStatus] ?? PAYMENT_STATUS.pending);

export const TICKET_PRIORITY: Record<TicketPriority, Badge> = {
  1: { label: "Low", badge: "badge-neutral" },
  2: { label: "Medium", badge: "badge-warning" },
  3: { label: "High", badge: "badge-danger" },
};

export const ticketState = (isAnswer: boolean): Badge =>
  isAnswer ? { label: "Answered", badge: "badge-success" } : { label: "Waiting", badge: "badge-accent" };

export const shortId = (id: string) => `#${String(id).slice(-6).toUpperCase()}`;

export const canCancelOrder = (order: { status: OrderStatus }) =>
  (ORDER_STATUS_MOVES[order.status] ?? []).includes("cancelled");

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
  { value: "replied", label: "Replied" },
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

export const personName = (user: { username?: string; phone?: string } | string | null | undefined, fallback = "-") =>
  user && typeof user === "object" ? user.username || user.phone || fallback : fallback;

export const ADMIN_ORDER_TABS: ReadonlyArray<Tab<AdminOrderStatusFilter>> = [
  ...ORDER_TABS,
  { value: "cash", label: "Collect cash" },
  { value: "overdue", label: "Cash overdue" },
];

export const awaitsCash = (order: Pick<OrderListItem, "status" | "paymentMethod" | "paymentStatus">) =>
  order.status === "shipped" && order.paymentMethod === "cash" && order.paymentStatus === "pending";

export const cashReceivedText = (order?: Pick<OrderListItem, "isDelivered"> | null) =>
  order?.isDelivered
    ? "The customer confirmed they received it. Only confirm once the courier has handed over the money - the order is marked paid and completed, and this can't be undone."
    : "⚠ The customer hasn't confirmed receipt yet. Only confirm if the courier has really handed over the money - the order is marked paid and completed, and this can't be undone.";

export const AUTO_COMPLETE_DAYS = 7;
export const AUTO_COMPLETE_AFTER_ETA_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export const autoCompleteDate = (order: Pick<OrderListItem, "shippedAt" | "expectedDeliveryAt">): Date | null => {
  if (order.expectedDeliveryAt) {
    return new Date(new Date(order.expectedDeliveryAt).getTime() + AUTO_COMPLETE_AFTER_ETA_DAYS * DAY_MS);
  }
  if (order.shippedAt) return new Date(new Date(order.shippedAt).getTime() + AUTO_COMPLETE_DAYS * DAY_MS);
  return null;
};

export const CONTACT_TABS: ReadonlyArray<Tab<ContactStatusFilter>> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Unanswered" },
  { value: "answered", label: "Answered" },
];

export const contactState = (status: string): Badge =>
  status === "answered" ? { label: "Answered", badge: "badge-success" } : { label: "New", badge: "badge-accent" };

export const CART_STATUS: Record<AdminCartStatus, Badge> = {
  active: { label: "Active", badge: "badge-new" },
  abandoned: { label: "Abandoned", badge: "badge-warning" },
  converted: { label: "Ordered", badge: "badge-success" },
};

export const cartState = (status: string): Badge =>
  CART_STATUS[status as AdminCartStatus] ?? { label: status || "Unknown", badge: "badge-neutral" };

export const CART_TABS: ReadonlyArray<Tab<AdminCartStatusFilter>> = [
  { value: "all", label: "All" },
  ...(Object.keys(CART_STATUS) as AdminCartStatus[]).map((value) => ({ value, label: CART_STATUS[value].label })),
];

export const timeAgo = (value?: string | null) => {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
};
