"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import swal from "sweetalert";
import { LuLogOut, LuStore, LuX } from "react-icons/lu";
import { panelNav, isLinkActive } from "./navLinks";

export default function Sidebar({ variant = "user", open = false, onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const nav = panelNav[variant] || panelNav.user;

    const logoutHandler = () => {
        swal({
            title: "Are you sure you want to log out?",
            icon: "warning",
            buttons: ["Cancel", "Log out"],
        }).then(async (confirmed) => {
            if (!confirmed) return;
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) router.replace("/login-register");
        });
    };

    return (
        <>
            {/* mobile overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-ink-950/50 backdrop-blur-[2px] transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-ink-950 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* brand */}
                <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-5 dark:border-white/10">
                    <Link href={nav.home} className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 text-sm font-bold text-white shadow-card">
                            SK
                        </span>
                        <span className="leading-tight">
                            <span className="block text-sm font-bold tracking-wide text-gray-900 dark:text-gray-100">SETKIDS</span>
                            <span className="block text-xs text-gray-700 dark:text-gray-500">{nav.title}</span>
                        </span>
                    </Link>
                    <button type="button" onClick={onClose} className="btn btn-ghost btn-icon lg:hidden" aria-label="Close menu">
                        <LuX className="size-5" />
                    </button>
                </div>

                {/* links */}
                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-600">Menu</p>
                    <ul className="space-y-1">
                        {nav.links.map((link) => {
                            const active = isLinkActive(pathname, link);
                            const Icon = link.icon;
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={onClose}
                                        aria-current={active ? "page" : undefined}
                                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
                                            ? "bg-sage-50 text-sage-700 dark:bg-sage-500/10 dark:text-sage-300"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100"}`}
                                    >
                                        {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-sage-500" />}
                                        <Icon className={`size-[18px] shrink-0 ${active ? "text-sage-600 dark:text-sage-300" : "text-gray-600 group-hover:text-gray-800 dark:group-hover:text-gray-300"}`} />
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* footer */}
                <div className="space-y-1 border-t border-gray-200 p-3 dark:border-white/10">
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
                        <LuStore className="size-[18px]" />
                        Back to store
                    </Link>
                    <button type="button" onClick={logoutHandler} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-500 transition-colors hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-500/10">
                        <LuLogOut className="size-[18px]" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}
