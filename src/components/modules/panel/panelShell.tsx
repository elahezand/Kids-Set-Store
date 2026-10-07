"use client";

import { type ReactNode, useState } from "react";
import Sidebar from "@/components/modules/panel/sidebar";
import Topbar from "@/components/modules/panel/topbar";
import type { PanelVariant } from "@/components/modules/panel/navLinks";
import type { SessionUser } from "@/types";

interface PanelShellProps {
  variant?: PanelVariant;
  user: SessionUser | null;
  children: ReactNode;
  logo?: string | null;
}

export default function PanelShell({ variant = "user", user, children, logo = null }: PanelShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-ink-900 dark:text-gray-100">
      <Sidebar variant={variant} open={sidebarOpen} onClose={() => setSidebarOpen(false)} logo={logo} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
