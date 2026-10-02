import type { IconType } from "react-icons";
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

export type PanelVariant = "admin" | "user";

export interface PanelLink {
  href: string;
  label: string;
  icon: IconType;
  /** only active on that exact path */
  exact?: boolean;
}

export interface PanelNav {
  title: string;
  home: string;
  links: PanelLink[];
}

// Sidebar navigation for each panel
export const panelNav: Record<PanelVariant, PanelNav> = {
  admin: {
    title: "Admin Panel",
    home: "/p-admin",
    links: [
      { href: "/p-admin", label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: "/p-admin/products", label: "Products", icon: LuPackage },
      { href: "/p-admin/users", label: "Users", icon: LuUsers },
      { href: "/p-admin/comments", label: "Comments", icon: LuMessageSquare },
      { href: "/p-admin/articles", label: "Articles", icon: LuNewspaper },
      { href: "/p-admin/tickets", label: "Tickets", icon: LuTicket },
      { href: "/p-admin/discounts", label: "Discounts", icon: LuBadgePercent },
      { href: "/p-admin/detail-account", label: "Account", icon: LuUserCog },
    ],
  },
  user: {
    title: "My Account",
    home: "/p-user",
    links: [
      { href: "/p-user", label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: "/p-user/orders", label: "Orders", icon: LuShoppingBag },
      { href: "/p-user/tickets", label: "Tickets", icon: LuTicket },
      { href: "/p-user/comments", label: "Comments", icon: LuMessageSquare },
      { href: "/p-user/favorites", label: "Favorites", icon: LuHeart },
      { href: "/p-user/detail-profile", label: "Profile", icon: LuUserCog },
    ],
  },
};

export const isLinkActive = (pathname: string, { href, exact }: Pick<PanelLink, "href" | "exact">) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
