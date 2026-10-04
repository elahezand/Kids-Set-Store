import {
  LuBadgePercent,
  LuHeart,
  LuLayoutDashboard,
  LuMessageSquare,
  LuNewspaper,
  LuPackage,
  LuShoppingBag,
  LuTicket,
  LuUserCog,
  LuUsers,
} from "react-icons/lu";
import { ROUTES } from "@/utils/constants";
import type { IconType } from "react-icons";

export type PanelVariant = "admin" | "user";

export interface PanelLink {
  href: string;
  label: string;
  icon: IconType;
  exact?: boolean;
}

export interface PanelNav {
  title: string;
  home: string;
  links: PanelLink[];
}

export const panelNav: Record<PanelVariant, PanelNav> = {
  admin: {
    title: "Admin Panel",
    home: ROUTES.admin.home,
    links: [
      { href: ROUTES.admin.home, label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: ROUTES.admin.orders, label: "Orders", icon: LuShoppingBag },
      { href: ROUTES.admin.products, label: "Products", icon: LuPackage },
      { href: ROUTES.admin.users, label: "Users", icon: LuUsers },
      { href: ROUTES.admin.comments, label: "Comments", icon: LuMessageSquare },
      { href: ROUTES.admin.articles, label: "Articles", icon: LuNewspaper },
      { href: ROUTES.admin.tickets, label: "Tickets", icon: LuTicket },
      { href: ROUTES.admin.discounts, label: "Discounts", icon: LuBadgePercent },
      { href: ROUTES.admin.account, label: "Account", icon: LuUserCog },
    ],
  },
  user: {
    title: "My Account",
    home: ROUTES.dashboard.home,
    links: [
      { href: ROUTES.dashboard.home, label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: ROUTES.dashboard.orders, label: "Orders", icon: LuShoppingBag },
      { href: ROUTES.dashboard.tickets, label: "Tickets", icon: LuTicket },
      { href: ROUTES.dashboard.comments, label: "Comments", icon: LuMessageSquare },
      { href: ROUTES.dashboard.favorites, label: "Favorites", icon: LuHeart },
      { href: ROUTES.dashboard.profile, label: "Profile", icon: LuUserCog },
    ],
  },
};

export const isLinkActive = (pathname: string, { href, exact }: Pick<PanelLink, "href" | "exact">) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
