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

export interface ProfileFormValues {
  username: string;
  email: string;
  phone: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}
