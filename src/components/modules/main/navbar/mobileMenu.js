"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegHeart } from "react-icons/fa";
import { LuChevronDown, LuX, LuMenu, LuChevronRight } from "react-icons/lu";
import CartCount from "./cart";
import ThemeToggle from "@/components/modules/ui/themeToggle";

const accountLinks = [
    { label: "Orders", href: "/p-user/orders" },
    { label: "Tickets", href: "/p-user/tickets" },
    { label: "Comments", href: "/p-user/comments" },
    { label: "Favorites", href: "/p-user/favorites" },
    { label: "Account detail", href: "/p-user/detail-profile" },
];

const pageLinks = [
    { label: "Home", href: "/" },
    { label: "All products", href: "/products" },
    { label: "Articles", href: "/articles" },
    { label: "Contact us", href: "/contact-us" },
    { label: "About us", href: "/about" },
    { label: "Rules", href: "/rules" },
];

export default function MobileMenu({ tree = [], username = null, favoriteCount = 0 }) {
    const [open, setOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(null);
    const [openSub, setOpenSub] = useState(null);
    const pathname = usePathname();

    // با تغییر صفحه منو بسته شود
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // قفل اسکرول صفحه + بستن با Escape
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const toggleCategory = (id) => {
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

            {/* پس‌زمینه تیره */}
            <div
                onClick={() => setOpen(false)}
                aria-hidden="true"
                className={`fixed inset-0 z-[9998] bg-ink-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
            />

            {/* کشوی منو */}
            <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label="Main menu"
                className={`fixed inset-y-0 left-0 z-[9999] flex h-[100dvh] w-[320px] max-w-[88vw] flex-col bg-white shadow-float transition-transform duration-300 ease-out dark:bg-ink-900 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* هدر کشو */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-white/10">
                    <Link href="/" className="text-xl font-bold text-sage-600 dark:text-sage-300">
                        SETKIDS
                    </Link>

                    <div className="flex items-center gap-3 text-xl text-gray-800 dark:text-gray-300">
                        <ThemeToggle />
                        <CartCount />
                        <Link href="/wishList" className="relative" aria-label="Favorites">
                            <FaRegHeart />
                            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-coral-400 text-[10px] leading-none text-white">
                                {favoriteCount || 0}
                            </span>
                        </Link>
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

                {/* بدنه اسکرول‌شونده */}
                <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-gray-500">
                        Categories
                    </p>

                    <ul className="flex flex-col">
                        {tree.map((category) => {
                            const hasChildren = category.children?.length > 0;
                            const isOpen = openCategory === category._id;

                            return (
                                <li key={category._id} className="border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center">
                                        {/* خود دسته‌ی اصلی همیشه قابل کلیک است */}
                                        <Link
                                            href={`/products?category=${category.name}`}
                                            className="flex-1 rounded-lg px-2 py-3.5 text-[15px] font-semibold capitalize text-text transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-white/5"
                                        >
                                            {category.name}
                                        </Link>

                                        {hasChildren && (
                                            <button
                                                type="button"
                                                onClick={() => toggleCategory(category._id)}
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

                                    {/* پنل زیردسته‌ها — باز و بسته شدن نرم بدون ارتفاع ثابت */}
                                    {hasChildren && (
                                        <div
                                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                }`}
                                        >
                                            <div className="overflow-hidden">
                                                <ul className="mb-2 ml-2 flex flex-col gap-0.5 border-l-2 border-sage-200 pl-3 dark:border-sage-700">
                                                    {category.children.map((sub) => {
                                                        const hasGrandChildren = sub.children?.length > 0;
                                                        const isSubOpen = openSub === sub._id;

                                                        return (
                                                            <li key={sub._id}>
                                                                <div className="flex items-center">
                                                                    <Link
                                                                        href={`/products?category=${sub.name}`}
                                                                        className="flex-1 rounded-lg px-2 py-2.5 text-sm capitalize text-gray-700 transition-colors hover:bg-gray-50 hover:text-sage-600 dark:text-gray-300 dark:hover:bg-white/5"
                                                                    >
                                                                        {sub.name}
                                                                    </Link>

                                                                    {hasGrandChildren && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setOpenSub(isSubOpen ? null : sub._id)}
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
                                                                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isSubOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                                                            }`}
                                                                    >
                                                                        <div className="overflow-hidden">
                                                                            <ul className="mb-1 ml-2 flex flex-col border-l border-gray-200 pl-3 dark:border-white/10">
                                                                                {sub.children.map((item) => (
                                                                                    <li key={item._id}>
                                                                                        <Link
                                                                                            href={`/products?category=${item.name}`}
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
                                                            href={`/products?category=${category.name}`}
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
                        {pageLinks.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={pathname === item.href ? "page" : undefined}
                                    className={`block rounded-lg px-2 py-2.5 text-[15px] transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${pathname === item.href
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
                                {accountLinks.map((item) => (
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

                {/* پاورقی کشو */}
                <div className="shrink-0 border-t border-gray-200 p-4 dark:border-white/10">
                    {username ? (
                        <Link href="/p-user" className="btn btn-lg btn-primary w-full">
                            My account
                        </Link>
                    ) : (
                        <Link href="/login-register" className="btn btn-lg btn-primary w-full">
                            Sign up / Log in
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
