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
    home: "/dashboard/admin",
    links: [
      { href: "/dashboard/admin", label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: "/dashboard/admin/products", label: "Products", icon: LuPackage },
      { href: "/dashboard/admin/users", label: "Users", icon: LuUsers },
      { href: "/dashboard/admin/comments", label: "Comments", icon: LuMessageSquare },
      { href: "/dashboard/admin/articles", label: "Articles", icon: LuNewspaper },
      { href: "/dashboard/admin/tickets", label: "Tickets", icon: LuTicket },
      { href: "/dashboard/admin/discounts", label: "Discounts", icon: LuBadgePercent },
      { href: "/dashboard/admin/detail-account", label: "Account", icon: LuUserCog },
    ],
  },
  user: {
    title: "My Account",
    home: "/dashboard",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard, exact: true },
      { href: "/dashboard/orders", label: "Orders", icon: LuShoppingBag },
      { href: "/dashboard/tickets", label: "Tickets", icon: LuTicket },
      { href: "/dashboard/comments", label: "Comments", icon: LuMessageSquare },
      { href: "/dashboard/favorites", label: "Favorites", icon: LuHeart },
      { href: "/dashboard/detail-profile", label: "Profile", icon: LuUserCog },
    ],
  },
};

export const isLinkActive = (pathname: string, { href, exact }: Pick<PanelLink, "href" | "exact">) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
