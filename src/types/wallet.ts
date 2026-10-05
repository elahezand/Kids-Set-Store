import type { Id, ISODate } from "./api";
import type { OrderStatus, PaymentStatus } from "./order";

export type WalletTransactionType = "spend" | "refund";

export interface WalletTransaction {
  _id: Id;
  amount: number;
  type: WalletTransactionType;
  note?: string;
  order?: { _id: Id; status: OrderStatus; paymentStatus: PaymentStatus } | null;
  createdAt?: ISODate;
}

export interface WalletSummary {
  balance: number;
  totals: { refunded: number; spent: number };
}
