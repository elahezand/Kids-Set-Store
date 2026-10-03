"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronDown, LuChevronRight, LuMenu, LuX } from "react-icons/lu";
import CartCount from "@/components/modules/main/navbar/cartCount";
import FavoritesCount from "@/components/modules/main/navbar/favoritesCount";
import { ACCOUNT_LINKS, PAGE_LINKS } from "@/components/modules/main/navbar/menuLinks";
import ThemeToggle from "@/components/modules/ui/themeToggle";
import { ROUTES } from "@/utils/constants";
import type { CategoryNode } from "@/types";

interface MobileMenuProps {
  tree?: CategoryNode[];
  username?: string | null;
  favoriteCount?: number;
}

export default function MobileMenu({ tree = [], username = null, favoriteCount = 0 }: MobileMenuProps) {
  const isLoggedIn = Boolean(username);
  const [open, setOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggleCategory = (id: string) => {
    setOpenSub(null);
    setOpenCategory((current) => (current === id ? null : id));
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex size-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/15"
      >
        <LuMenu className="size-6" />
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[9998] bg-ink-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`fixed inset-y-0 left-0 z-[9999] flex h-[100dvh] w-[320px] max-w-[88vw] flex-col bg-white shadow-float transition-transform duration-300 ease-out dark:bg-ink-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-white/10">
          <Link href={ROUTES.home} className="text-xl font-bold text-sage-600 dark:text-sage-300">
            SETKIDS
          </Link>

          <div className="flex items-center gap-3 text-xl text-gray-800 dark:text-gray-300">
            <ThemeToggle />
            <CartCount isLoggedIn={isLoggedIn} />
            <FavoritesCount
              isLoggedIn={isLoggedIn}
              initialCount={favoriteCount}
              badgeClassName="-right-2 -top-2 bg-coral-400"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="ml-1 flex size-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <LuX className="size-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-500">
            Categories
          </p>

          <ul className="flex flex-col">
            {tree.map((category) => {
              const hasChildren = category.children?.length > 0;
              const isOpen = openCategory === category.id;

              return (
                <li key={category.id} className="border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center">
                    <Link
                      href={ROUTES.category(category.slug)}
                      className="flex-1 rounded-lg px-2 py-3.5 text-[15px] font-semibold capitalize text-text transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5"
                    >
                      {category.name}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${category.name} subcategories`}
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      >
                        <LuChevronDown
                          className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && (
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="mb-2 ml-2 flex flex-col gap-0.5 border-l-2 border-sage-200 pl-3 dark:border-sage-700">
                          {category.children.map((sub) => {
                            const hasGrandChildren = sub.children?.length > 0;
                            const isSubOpen = openSub === sub.id;

                            return (
                              <li key={sub.id}>
                                <div className="flex items-center">
                                  <Link
                                    href={ROUTES.category(sub.slug)}
                                    className="flex-1 rounded-lg px-2 py-2.5 text-sm capitalize text-gray-700 transition-colors hover:bg-gray-50 hover:text-sage-600 dark:text-gray-300 dark:hover:bg-white/5"
                                  >
                                    {sub.name}
                                  </Link>

                                  {hasGrandChildren && (
                                    <button
                                      type="button"
                                      onClick={() => setOpenSub(isSubOpen ? null : sub.id)}
                                      aria-expanded={isSubOpen}
                                      aria-label={`${isSubOpen ? "Hide" : "Show"} ${sub.name} subcategories`}
                                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-white/5"
                                    >
                                      <LuChevronRight
                                        className={`size-4 transition-transform duration-300 ${isSubOpen ? "rotate-90" : ""}`}
                                      />
                                    </button>
                                  )}
                                </div>

                                {hasGrandChildren && (
                                  <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                                      isSubOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                    }`}
                                  >
                                    <div className="overflow-hidden">
                                      <ul className="mb-1 ml-2 flex flex-col border-l border-gray-200 pl-3 dark:border-white/10">
                                        {sub.children.map((item) => (
                                          <li key={item.id}>
                                            <Link
                                              href={ROUTES.category(item.slug)}
                                              className="block rounded-lg px-2 py-2 text-sm capitalize text-gray-600 transition-colors hover:text-sage-600 dark:text-gray-500"
                                            >
                                              {item.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </li>
                            );
                          })}

                          <li>
                            <Link
                              href={ROUTES.category(category.slug)}
                              className="block rounded-lg px-2 py-2.5 text-sm font-semibold text-coral-400 transition-colors hover:text-coral-500"
                            >
                              View all {category.name}
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="px-2 pb-2 pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-500">
            Menu
          </p>
          <ul className="flex flex-col">
            {PAGE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`block rounded-lg px-2 py-2.5 text-[15px] transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                    pathname === item.href
                      ? "font-semibold text-sage-600 dark:text-sage-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {username && (
            <>
              <p className="px-2 pb-2 pt-6 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-500">
                {username}
              </p>
              <ul className="flex flex-col">
                {ACCOUNT_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-lg px-2 py-2.5 text-[15px] text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-gray-200 p-4 dark:border-white/10">
          {username ? (
            <Link href={ROUTES.dashboard.home} className="btn btn-lg btn-primary w-full">
              My account
            </Link>
          ) : (
            <Link href={ROUTES.login} className="btn btn-lg btn-primary w-full">
              Sign up / Log in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
