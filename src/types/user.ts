import type { Id } from "./api";
import type { SavedAddress } from "./order";

/* the logged-in user as the main site needs it (never includes password) */
export interface SessionUser {
  _id: Id;
  username: string;
  phone: string;
  email?: string;
  role: Array<"USER" | "ADMIN">;
  wallet?: { balance: number };
  addresses?: SavedAddress[];
}
