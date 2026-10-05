import type { Id, ISODate } from "./api";

export type OrderStatus = "created" | "processing" | "shipped" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cash" | "zarinpal" | "wallet";

export type CheckoutPaymentMethod = Extract<PaymentMethod, "cash" | "zarinpal">;

export interface ShippingAddress {
  name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
}

export type SavedAddress = Omit<ShippingAddress, "phone">;

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shippingCost: number;
  walletUsed: number;
  total: number;
}

export interface OrderPayment {
  authority: string | null;
  refId: string | null;
  paidAt: ISODate | null;
}

export interface OrderSummary {
  _id: Id;
  user: Id;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  pricing: OrderPricing;
  payment?: OrderPayment;
  createdAt?: ISODate;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: CheckoutPaymentMethod;
  useWallet: boolean;
  idempotencyKey: string;
}

export interface CheckoutResult {
  order: OrderSummary;
  paymentUrl: string | null;
}

export type PaymentResultState = "paid" | "pending" | "failed";

export interface CheckoutFormValues extends ShippingAddress {
  paymentMethod: CheckoutPaymentMethod;
  useWallet?: boolean;
}

export interface OrderItem {
  _id: Id;
  productId: Id;
  quantity: number;
  finalPrice: number;
  productSnapshot: { title: string; image: string | null; slug: string | null };
  variantSnapshot?: { attributes: Record<string, string> | null; sku: string | null };
}

export interface OrderListItem extends OrderSummary {
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  coupon?: { code: string } | null;
  trackingCode?: string | null;
  shippedAt?: ISODate | null;
  expectedDeliveryAt?: ISODate | null;
  isDelivered?: boolean;
  deliveredAt?: ISODate | null;
  refundAmount?: number;
  refundedAt?: ISODate | null;
}

export type OrderStatusFilter = "all" | OrderStatus;

export type AdminOrderStatusFilter = OrderStatusFilter | "cash" | "overdue";

export interface AdminOrderItem extends OrderItem {
  price?: number;
}

export interface AdminOrder extends Omit<OrderListItem, "user" | "items"> {
  user: { _id: Id; username?: string; phone?: string } | Id | null;
  items: AdminOrderItem[];
  shippingAddress?: ShippingAddress;
  coupon?: { code: string } | null;
  isCashOverdue?: boolean;
  refundAmount?: number;
  refundedAt?: ISODate | null;
  shippedAt?: ISODate | null;
  deliveredAt?: ISODate | null;
}

export interface UpdateOrderPayload {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface ShipOrderPayload {
  orderId: Id;
  trackingCode: string;
  estimatedDeliveryAt?: string;
}
