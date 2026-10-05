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

/**
 * The panel user, read once per request.
 * When the access token expired, the user comes from the refresh token (a server component can't set the new
 * cookies, so `expired` tells RefreshAccessToken to rotate them on the client). An expired or forged access
 * token with no valid refresh token is no session at all.
 */
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

/**
 * admin pages / layout: an admin, or redirect.
 * Every admin page calls this itself — Next renders a page even when its layout redirects,
 * so the layout check alone would still send the page's data to a non-admin.
 */
export const requireAdmin = async (): Promise<PanelSession & { user: SessionUser }> => {
  const session = await requirePanelUser();
  if (!isAdmin(session.user)) redirect(ROUTES.dashboard.home);
  return session;
};
