import type { Id, ISODate } from "./api";

export type CouponType = "fixed" | "percent";
export type CouponStatusFilter = "all" | "active" | "inactive";

export interface Coupon {
  _id: Id;
  code: string;
  type: CouponType;
  amount: number;
  maxDiscount: number | null;
  isActive: boolean;
  startsAt: ISODate | null;
  expiresAt: ISODate | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt?: ISODate;
}

/* body of POST /api/admin/coupon (validators/coupon createCouponSchema) */
export interface CouponPayload {
  code: string;
  type: CouponType;
  amount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive?: boolean;
}
