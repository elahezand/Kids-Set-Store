import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { ACCOUNT_LINKS, INFO_LINKS, type MenuLink } from "@/components/modules/main/navbar/menuLinks";
import { ROUTES } from "@/utils/constants";
import type { CategoryNode } from "@/types";

const userLinks: MenuLink[] = [{ href: ROUTES.dashboard.home, label: "Dashboard" }, ...ACCOUNT_LINKS];

const topLinkClass =
  "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium text-current transition-colors hover:bg-current/10 group-hover:bg-current/10 group-focus-within:bg-current/10 xl:px-3.5";

const openOnHover =
  "invisible opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100";

const Arrow = () => (
  <IoIosArrowDown
    aria-hidden="true"
    className="size-3.5 text-coral-400 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
  />
);

function SmallDropdown({
  label,
  href,
  links,
  align = "left",
}: {
  label: string;
  href?: string;
  links: MenuLink[];
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

const columnsClass = (count: number) =>
  count >= 4 ? "grid-cols-4" : count === 3 ? "grid-cols-3" : count === 2 ? "grid-cols-2" : "grid-cols-1";

function CategoryItem({ category }: { category: CategoryNode }) {
  const hasChildren = category.children.length > 0;

  return (
    <li className="group static">
      <Link href={ROUTES.category(category.slug)} className={topLinkClass}>
        {category.name}
        {hasChildren && <Arrow />}
      </Link>

      {hasChildren && (
        <div className={`absolute inset-x-0 top-[calc(100%-20px)] z-[1000] pt-2 ${openOnHover}`}>
          <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-float dark:bg-ink-800">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-white/10">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100">{category.name}</p>
              <Link
                href={ROUTES.category(category.slug)}
                className="text-sm font-medium text-sage-600 hover:text-coral-500 dark:text-sage-300"
              >
                View all →
              </Link>
            </div>

            <div className={`grid gap-x-8 gap-y-6 ${columnsClass(category.children.length)}`}>
              {category.children.map((sub) => (
                <div key={sub.id} className="min-w-0">
                  <Link
                    href={ROUTES.category(sub.slug)}
                    className="mb-2 block truncate text-[15px] font-semibold text-sage-600 transition-colors hover:text-coral-500 dark:text-sage-300"
                  >
                    {sub.name}
                  </Link>

                  {sub.children.length > 0 && (
                    <ul className="space-y-0.5 border-l-2 border-coral-100 pl-3 dark:border-white/10">
                      {sub.children.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={ROUTES.category(item.slug)}
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
        <Link href={ROUTES.home} className={topLinkClass}>
          Home
        </Link>
      </li>

      {tree.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}

      <li>
        <Link href={ROUTES.articles} className={topLinkClass}>
          Articles
        </Link>
      </li>

      <SmallDropdown label="More" links={INFO_LINKS} />

      {username ? (
        <SmallDropdown label={username} href={ROUTES.dashboard.home} links={userLinks} align="right" />
      ) : (
        <li className="ml-1">
          <Link
            href={ROUTES.login}
            className="btn btn-sm whitespace-nowrap rounded-full border-2 border-coral-400 px-4 py-1.5 text-current transition-colors hover:border-coral-500 hover:bg-coral-500 hover:text-white"
          >
            Sign up / Log in
          </Link>
        </li>
      )}
    </ul>
  );
}