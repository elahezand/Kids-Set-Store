"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LuBell, LuMenu, LuSearch } from "react-icons/lu";
import ThemeToggle from "@/components/modules/ui/themeToggle";

const DEFAULT_AVATAR = "/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg";

export default function Topbar({ user, onMenuClick, notifications = [] }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const boxRef = useRef(null);

    useEffect(() => {
        const onClick = (e) => boxRef.current && !boxRef.current.contains(e.target) && setShowNotifications(false);
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-ink-900/85">
            <button type="button" onClick={onMenuClick} className="btn btn-ghost btn-icon -ml-2 lg:hidden" aria-label="Open menu">
                <LuMenu className="size-5" />
            </button>

            {/* search */}
            <label className="relative hidden w-full max-w-sm md:block">
                <LuSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-600" />
                <input type="search" placeholder="Search…" className="input py-2 pl-9 shadow-none" />
            </label>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <ThemeToggle />

                <div className="relative" ref={boxRef}>
                    <button
                        type="button"
                        onClick={() => setShowNotifications((v) => !v)}
                        className="btn btn-ghost btn-icon relative"
                        aria-label="Notifications"
                    >
                        <LuBell className="size-5" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-coral-400 ring-2 ring-white dark:ring-ink-900" />
                        )}
                    </button>
                    {showNotifications && (
                        <div className="card absolute right-0 mt-2 w-72 animate-scale-in overflow-hidden shadow-float">
                            <div className="card-header py-3">
                                <p className="card-title text-sm">Notifications</p>
                            </div>
                            {notifications.length ? (
                                <ul className="max-h-72 divide-y divide-gray-200 overflow-y-auto dark:divide-white/5">
                                    {notifications.map((item, i) => (
                                        <li key={i} className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-4 py-8 text-center text-sm text-gray-700 dark:text-gray-500">You&apos;re all caught up.</p>
                            )}
                        </div>
                    )}
                </div>

                <span className="mx-1 hidden h-8 w-px bg-gray-200 sm:block dark:bg-white/10" />

                <div className="flex items-center gap-3">
                    <Image
                        width={36}
                        height={36}
                        alt={user?.username || "avatar"}
                        src={user?.avatar || DEFAULT_AVATAR}
                        className="size-9 rounded-full object-cover ring-2 ring-sage-100 dark:ring-white/10"
                    />
                    <div className="hidden leading-tight sm:block">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.username}</p>
                        <p className="text-xs text-gray-700 capitalize dark:text-gray-500">{(user?.role || "user").toLowerCase()}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
