import { cache } from "react";
import connectToDB from "@/configs/db";
import { authUser } from "@/utils/auth/authGuard";
import { toPlain } from "@/utils/format";
import type { SessionUser } from "@/types";

export interface PanelSession {
  user: SessionUser | null;
  expired: boolean;
}

export const getPanelSession = cache(async (): Promise<PanelSession> => {
  await connectToDB();
  const user = await authUser();

  if (!user) return { user: null, expired: false };
  if (user.status === "expired") return { user: null, expired: true };

  return { user: toPlain(user.toJSON()) as SessionUser, expired: false };
});
