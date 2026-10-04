"use client";

import { useQueryParams } from "@/services/client/listing";

export interface StatusTab<T extends string> {
  value: T;
  label: string;
}

interface StatusTabsProps<T extends string> {
  tabs: ReadonlyArray<StatusTab<T>>;
  value: T;
  /** query param the tabs write to (default `status`) */
  param?: string;
}

export default function StatusTabs<T extends string>({ tabs, value, param = "status" }: StatusTabsProps<T>) {
  const { update, isPending } = useQueryParams<string>();

  return (
    <div className="-mx-1 max-w-full overflow-x-auto px-1">
      <div role="tablist" className="flex w-max gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={isPending}
              onClick={() => update({ [param]: tab.value === "all" ? null : tab.value })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm ${
                active
                  ? "bg-white text-sage-700 shadow-card dark:bg-ink-800 dark:text-sage-300"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
