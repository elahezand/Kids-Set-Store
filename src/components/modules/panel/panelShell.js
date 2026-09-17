"use client";
import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

// Shared layout for the admin & user panels: sidebar + topbar + content area
export default function PanelShell({ variant = "user", user, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-ink-900 dark:text-gray-100">
            <Sidebar variant={variant} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            </div>
        </div>
    );
}
