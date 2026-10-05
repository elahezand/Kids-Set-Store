import type { Id, ISODate } from "./api";
import type { SavedAddress } from "./order";

export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  _id: Id;
  username: string;
  phone: string;
  email?: string;
  role: UserRole[];
  wallet?: { balance: number };
  addresses?: SavedAddress[];
  profilePicture?: string | null;
  createdAt?: ISODate;
}

export type UserRoleFilter = "all" | UserRole;

export interface AdminUser extends SessionUser {
  joinedAt?: ISODate;
  lastLoginAt?: ISODate | null;
  lastDevice?: string | null;
  activeSessions?: number;
  ordersCount?: number;
  isBanned?: boolean;
}
