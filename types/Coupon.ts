
export interface Coupon {
  _id: string;
  code: string;
  type: "fixed" | "percent";
  amount: number;
  maxDiscount?: number | null;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  createdAt: string;
}


export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}

export interface CreateCouponPayload {
  code: string;
  type: "fixed" | "percent";
  amount: number;
  maxDiscount?: number | null;
  isActive?: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
}

export interface UpdateCouponPayload {
  _id: string;
  type?: "fixed" | "percent";
  amount?: number;
  maxDiscount?: number | null;
  isActive?: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
}

export interface CouponMutationResponse {
  success: boolean;
  data: Coupon;
}

export interface FormState {
  _id?: string;
  code: string;
  type: "fixed" | "percent";
  amount: string;
  maxDiscount: string;
  isActive: boolean;
  expiresAt: string;
  usageLimit: string;
}
