import { ROUTES } from "@/utils/constants";

export interface MenuLink {
  href: string;
  label: string;
}

export const ACCOUNT_LINKS: MenuLink[] = [
  { href: ROUTES.dashboard.orders, label: "Orders" },
  { href: ROUTES.dashboard.tickets, label: "Tickets" },
  { href: ROUTES.dashboard.comments, label: "Comments" },
  { href: ROUTES.dashboard.favorites, label: "Favorites" },
  { href: ROUTES.dashboard.profile, label: "Account details" },
];

export const INFO_LINKS: MenuLink[] = [
  { href: ROUTES.contact, label: "Contact us" },
  { href: ROUTES.about, label: "About us" },
  { href: ROUTES.rules, label: "Rules" },
];

export const PAGE_LINKS: MenuLink[] = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.products, label: "All products" },
  { href: ROUTES.articles, label: "Articles" },
  ...INFO_LINKS,
];
