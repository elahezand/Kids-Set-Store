export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected";

export interface Withdrawal {
  _id: string;
  amount: number;
  bankAccount: { iban: string; ownerName: string };
  status: WithdrawalStatus;
  trackingCode?: string | null;
  rejectReason?: string | null;
  createdAt: string;
  store?: { _id: string; name?: string; owner?: string } | string;
}

export interface ProcessWithdrawalPayload {
  id: string;
  status: "processing" | "completed" | "rejected";
  trackingCode?: string;
  rejectReason?: string;
}

export interface WithdrawalsResponse {
  success: boolean;
  data: Withdrawal[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}