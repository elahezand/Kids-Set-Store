import type { Id, ISODate } from "./api";
import type { CartItem, CartPricing } from "./cart";

/* ---------- categories ---------- */

export interface AdminCategory {
  _id: Id;
  title: string;
  slug: string;
  description: string;
  parentId: Id | null;
  isActive: boolean;
  productsCount: number;
  childrenCount: number;
  createdAt?: ISODate;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  parentId: Id | null;
}

/* ---------- ticket departments ---------- */

export interface AdminDepartment {
  id: Id;
  title: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt?: ISODate;
}

export interface DepartmentPayload {
  title: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

/* ---------- contact messages ---------- */

export type ContactStatus = "pending" | "answered";
export type ContactStatusFilter = "all" | ContactStatus;

export interface ContactMessage {
  _id: Id;
  name: string;
  email: string;
  phone: string;
  body: string;
  status: ContactStatus;
  answer: string | null;
  answeredBy?: { _id: Id; username?: string } | Id | null;
  answeredAt?: ISODate | null;
  createdAt?: ISODate;
}

/* ---------- newsletter ---------- */

export interface NewsletterSubscriber {
  _id: Id;
  email: string;
  createdAt?: ISODate;
}

/* ---------- carts ---------- */

export type AdminCartStatus = "active" | "abandoned" | "converted";
export type AdminCartStatusFilter = "all" | AdminCartStatus;

export interface CartOwner {
  _id: Id;
  username?: string;
  phone?: string;
  email?: string;
}

export interface AdminCart {
  _id: Id;
  user: CartOwner | Id | null;
  items: Array<{
    productId: { _id: Id; title: string; images?: string[] } | Id | null;
    variantId: Id | null;
    quantity: number;
  }>;
  coupon?: Id | null;
  status: AdminCartStatus;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

export interface AdminCartDetail {
  id: Id;
  user: CartOwner | null;
  status: AdminCartStatus;
  items: CartItem[];
  coupon: { _id: Id; code: string } | null;
  pricing: CartPricing;
  removedItems: Array<{ productId?: Id; reason: string }>;
  couponRemoved: string | null;
  updatedAt?: ISODate;
}

/* ---------- admins & notifications ---------- */

export interface AdminAccount {
  _id: Id;
  username: string;
  phone: string;
  email?: string;
  profilePicture?: string | null;
  createdAt?: ISODate;
}

export interface NotificationPayload {
  user: Id;
  msg: string;
  link?: string | null;
}

/* ---------- order sweeps ---------- */

export interface OrderSweepResult {
  finished: number;
  paid: number;
  cancelled: number;
  completed: number;
  overdueCash: number;
}

export interface AdminSubDepartment {
  id: Id;
  title: string;
  ticketsCount: number;
}

export interface AdminDepartmentOverview extends AdminDepartment {
  ticketsCount: number;
  subDepartments: AdminSubDepartment[];
}

export interface OrderSweepStatus {
  dueForCompletion: number;
  overdueCash: number;
  timerDisabled: boolean;
  timerMinutes: number;
  cronConfigured: boolean;
}

