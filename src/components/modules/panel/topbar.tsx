"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuBell, LuMenu } from "react-icons/lu";
import ThemeToggle from "@/components/modules/ui/themeToggle";
import { useMarkNotificationSeen, useNotifications } from "@/services/client/panel";
import { formatDate } from "@/utils/format";
import { DEFAULT_AVATAR } from "@/utils/panelView";
import { roleLabel } from "@/utils/role";
import type { SessionUser } from "@/types";

interface TopbarProps {
  user: SessionUser | null;
  onMenuClick: () => void;
}

export default function Topbar({ user, onMenuClick }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const { data } = useNotifications();
  const markSeen = useMarkNotificationSeen();
  const notifications = data?.data ?? [];
  const unread = notifications.filter((item) => !item.see).length;

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/85 px-4 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-ink-900/85">
      <button type="button" onClick={onMenuClick} className="btn btn-ghost btn-icon -ml-2 lg:hidden" aria-label="Open menu">
        <LuMenu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="relative" ref={boxRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((value) => !value)}
            className="btn btn-ghost btn-icon relative"
            aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
            aria-expanded={showNotifications}
          >
            <LuBell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-coral-400 px-1 text-[10px] leading-4 font-semibold text-white ring-2 ring-white dark:ring-ink-900">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showNotifications && (
            /* phones: full width under the bar; sm+: dropdown under the bell */
            <div className="card fixed inset-x-3 top-[4.25rem] animate-scale-in overflow-hidden shadow-float sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80">
              <div className="card-header py-3">
                <p className="card-title text-sm">Notifications</p>
              </div>
              {notifications.length ? (
                <ul className="max-h-80 divide-y divide-gray-200 overflow-y-auto dark:divide-white/5">
                  {notifications.map((item) => {
                    const content = (
                      <>
                        <span className="flex items-start gap-2">
                          {!item.see && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-coral-400" />}
                          <span className={item.see ? "text-gray-600 dark:text-gray-500" : "font-medium"}>{item.msg}</span>
                        </span>
                        <span className="mt-1 block text-xs text-gray-600">{formatDate(item.createdAt)}</span>
                      </>
                    );
                    const onOpen = () => {
                      if (!item.see) markSeen.mutate(item._id);
                      setShowNotifications(false);
                    };
                    return (
                      <li key={item._id} className="text-sm text-gray-800 dark:text-gray-300">
                        {item.link ? (
                          <Link href={item.link} onClick={onOpen} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5">
                            {content}
                          </Link>
                        ) : (
                          <button type="button" onClick={onOpen} className="block w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5">
                            {content}
                          </button>
                        )}
                      </li>
                    );
                  })}
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
            src={user?.profilePicture || DEFAULT_AVATAR}
            className="size-9 rounded-full object-cover ring-2 ring-sage-100 dark:ring-white/10"
          />
          <div className="hidden max-w-40 leading-tight sm:block">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.username}</p>
            <p className="text-xs text-gray-700 dark:text-gray-500">{roleLabel(user?.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
