import type { Id, ISODate } from "./api";
import type { SavedAddress } from "./order";

export type UserRole = "USER" | "ADMIN";

/* the logged-in user as the site needs it (never includes password) */
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

/* profile form (panels) — validators/user profileValidationSchema */
export interface ProfileFormValues {
  username: string;
  email: string;
  phone: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}
