import type { Id, ISODate } from "./api";

/* model/order.js */

export type OrderStatus = "created" | "processing" | "shipped" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cash" | "zarinpal" | "wallet";

/* the methods a buyer can pick at checkout */
export type CheckoutPaymentMethod = Extract<PaymentMethod, "cash" | "zarinpal">;

export interface ShippingAddress {
  name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
}

/* saved address on the user (model/user addressSchema has no phone) */
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

/* POST /api/user/order */
export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  paymentMethod: CheckoutPaymentMethod;
  useWallet: boolean;
  idempotencyKey: string;
}

export interface CheckoutResult {
  order: OrderSummary;
  /** ZarinPal StartPay url; null for cash / fully wallet-paid orders */
  paymentUrl: string | null;
}

/* /checkout/verify page */
export type PaymentResultState = "paid" | "pending" | "failed";

/* the checkout form = address + payment choice */
export interface CheckoutFormValues extends ShippingAddress {
  paymentMethod: CheckoutPaymentMethod;
  useWallet?: boolean;
}
