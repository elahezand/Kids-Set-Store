import {
  LuBadgePercent,
  LuBell,
  LuFolderTree,
  LuHeart,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuMail,
  LuMessageSquare,
  LuNewspaper,
  LuPackage,
  LuSend,
  LuSettings,
  LuShieldCheck,
  LuShoppingBag,
  LuShoppingCart,
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
  section?: string;
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
      { href: ROUTES.admin.home, label: "Dashboard", icon: LuLayoutDashboard, exact: true, section: "Overview" },
      { href: ROUTES.admin.orders, label: "Orders", icon: LuShoppingBag, section: "Sales" },
      { href: ROUTES.admin.carts, label: "Carts", icon: LuShoppingCart, section: "Sales" },
      { href: ROUTES.admin.discounts, label: "Discounts", icon: LuBadgePercent, section: "Sales" },
      { href: ROUTES.admin.products, label: "Products", icon: LuPackage, section: "Catalog" },
      { href: ROUTES.admin.categories, label: "Categories", icon: LuFolderTree, section: "Catalog" },
      { href: ROUTES.admin.users, label: "Users", icon: LuUsers, section: "People" },
      { href: ROUTES.admin.admins, label: "Admins", icon: LuShieldCheck, section: "People" },
      { href: ROUTES.admin.tickets, label: "Tickets", icon: LuTicket, section: "Support" },
      { href: ROUTES.admin.departments, label: "Departments", icon: LuLifeBuoy, section: "Support" },
      { href: ROUTES.admin.contacts, label: "Messages", icon: LuMail, section: "Support" },
      { href: ROUTES.admin.comments, label: "Comments", icon: LuMessageSquare, section: "Support" },
      { href: ROUTES.admin.articles, label: "Articles", icon: LuNewspaper, section: "Content" },
      { href: ROUTES.admin.newsletter, label: "Newsletter", icon: LuSend, section: "Content" },
      { href: ROUTES.admin.siteInfo, label: "Site info", icon: LuSettings, section: "Settings" },
      { href: ROUTES.admin.account, label: "Account", icon: LuUserCog, section: "Settings" },
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
