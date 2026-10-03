import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import type { CategoryNode } from "@/types";

/*
  Desktop links of the navbar (lg+).
  - a category with children opens a MEGA PANEL as wide as the navbar: one column per
    sub-category, its own children listed under it -> nothing overlaps, long lists fit.
  - "More" and the user menu are small dropdowns.
  Pure CSS: hover opens them, keyboard focus (Tab) opens them too (group-focus-within).
*/

export const categoryHref = (category: Pick<CategoryNode, "slug">) =>
  `/products?category=${encodeURIComponent(category.slug)}`;

const userLinks = [
  { href: "/p-user", label: "Dashboard" },
  { href: "/p-user/orders", label: "Orders" },
  { href: "/p-user/tickets", label: "Tickets" },
  { href: "/p-user/comments", label: "Comments" },
  { href: "/p-user/favorites", label: "Favorites" },
  { href: "/p-user/detail-profile", label: "Account details" },
];

const moreLinks = [
  { href: "/contact-us", label: "Contact us" },
  { href: "/about", label: "About us" },
  { href: "/rules", label: "Rules" },
];

/* top-level pill */
const topLinkClass =
  "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium text-white transition-colors hover:bg-white/15 group-hover:bg-white/15 group-focus-within:bg-white/15 xl:px-3.5";

/* shown on hover or when something inside has keyboard focus */
const openOnHover =
  "invisible opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";

const Arrow = () => (
  <IoIosArrowDown
    aria-hidden="true"
    className="size-3.5 text-coral-200 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
  />
);

/* small dropdown under one item (More, user menu) */
function SmallDropdown({
  label,
  href,
  links,
  align = "left",
}: {
  label: string;
  href?: string;
  links: Array<{ href: string; label: string }>;
  align?: "left" | "right";
}) {
  return (
    <li className="group relative">
      {href ? (
        <Link href={href} className={topLinkClass}>
          {label}
          <Arrow />
        </Link>
      ) : (
        <button type="button" className={topLinkClass} aria-haspopup="true">
          {label}
          <Arrow />
        </button>
      )}

      {/* pt-2 = invisible bridge, so the menu stays open while the mouse moves down */}
      <div className={`absolute top-full z-[1000] pt-2 ${align === "right" ? "right-0" : "left-0"} ${openOnHover}`}>
        <ul className="min-w-52 rounded-2xl bg-white p-2 shadow-float dark:bg-ink-800">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-coral-50 hover:text-coral-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-coral-300"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/* 1 / 2 / 3 / 4 columns depending on how many sub-categories there are */
const columnsClass = (count: number) =>
  count >= 4 ? "grid-cols-4" : count === 3 ? "grid-cols-3" : count === 2 ? "grid-cols-2" : "grid-cols-1";

function CategoryItem({ category }: { category: CategoryNode }) {
  const hasChildren = category.children.length > 0;

  return (
    <li className="group static">
      <Link href={categoryHref(category)} className={topLinkClass}>
        {category.name}
        {hasChildren && <Arrow />}
      </Link>

      {hasChildren && (
        <div className={`absolute inset-x-0 top-[50px] z-[1000] pt-2 ${openOnHover}`}>
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-float dark:bg-ink-800">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-white/10">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">{category.name}</p>
              <Link
                href={categoryHref(category)}
                className="text-sm font-medium text-sage-600 hover:text-coral-500 dark:text-sage-300"
              >
                View all →
              </Link>
            </div>

            <div className={`grid gap-x-8 gap-y-6 ${columnsClass(category.children.length)}`}>
              {category.children.map((sub) => (
                <div key={sub.id} className="min-w-0">
                  <Link
                    href={categoryHref(sub)}
                    className="mb-2 block truncate text-[15px] font-semibold text-sage-600 transition-colors hover:text-coral-500 dark:text-sage-300"
                  >
                    {sub.name}
                  </Link>

                  {sub.children.length > 0 && (
                    <ul className="space-y-0.5 border-l-2 border-coral-100 pl-3 dark:border-white/10">
                      {sub.children.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={categoryHref(item)}
                            className="block truncate py-1 text-sm text-gray-600 transition-colors hover:text-coral-500 dark:text-gray-300 dark:hover:text-coral-300"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

interface DesktopMenuProps {
  tree: CategoryNode[];
  username: string | null;
}

export default function DesktopMenu({ tree, username }: DesktopMenuProps) {
  return (
    <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
      <li>
        <Link href="/" className={topLinkClass}>
          Home
        </Link>
      </li>

      {tree.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}

      <li>
        <Link href="/articles" className={topLinkClass}>
          Articles
        </Link>
      </li>

      {/* Contact / About / Rules share one menu so the bar is not crowded */}
      <SmallDropdown label="More" links={moreLinks} />

      {username ? (
        <SmallDropdown label={username} href="/p-user" links={userLinks} align="right" />
      ) : (
        <li className="ml-1">
          <Link
            href="/login-register"
            className="btn btn-sm whitespace-nowrap rounded-full border-2 border-coral-300 px-4 py-1.5 text-white transition-colors hover:bg-coral-300"
          >
            Sign up / Log in
          </Link>
        </li>
      )}
    </ul>
  );
}
