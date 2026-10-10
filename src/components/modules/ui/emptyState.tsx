import { LuInbox } from "react-icons/lu";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: IconType;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = LuInbox,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:py-14 ${className}`}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        <Icon className="size-7" />
      </span>
      <div>
        <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-700 dark:text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
