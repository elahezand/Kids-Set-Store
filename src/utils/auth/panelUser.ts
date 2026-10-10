import { cache } from "react";
import { redirect } from "next/navigation";
import connectToDB from "@/configs/db";
import { authUser, getMe } from "@/utils/auth/authGuard";
import { ROUTES } from "@/utils/constants";
import { toPlain } from "@/utils/format";
import { isAdmin } from "@/utils/role";
import type { SessionUser } from "@/types";

export interface PanelSession {
  user: SessionUser | null;
  expired: boolean;
}

const plainUser = (user: { toJSON: () => unknown }) => toPlain(user.toJSON()) as SessionUser;

export const getPanelSession = cache(async (): Promise<PanelSession> => {
  await connectToDB();
  const user = await authUser();

  if (!user) return { user: null, expired: false };

  if (user.status === "expired") {
    const me = await getMe();
    return me ? { user: plainUser(me), expired: true } : { user: null, expired: false };
  }

  return { user: plainUser(user), expired: false };
});

export const requirePanelUser = async (): Promise<PanelSession & { user: SessionUser }> => {
  const session = await getPanelSession();
  if (!session.user) redirect(ROUTES.login);
  return session as PanelSession & { user: SessionUser };
};

export const requireAdmin = async (): Promise<PanelSession & { user: SessionUser }> => {
  const session = await requirePanelUser();
  if (!isAdmin(session.user)) redirect(ROUTES.dashboard.home);
  return session;
};
