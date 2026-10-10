"use client";

import { useState } from "react";
import { LuCalendarDays, LuX } from "react-icons/lu";
import { useQueryParams } from "@/services/client/listing";
import { DATE_PRESETS, type DateFilters } from "@/utils/adminFilters";

interface DateRangeFilterProps {
  value: DateFilters;
  label?: string;
}

const CUSTOM = "custom";

const PRESET_DAYS: Record<string, number> = { today: 0, "7d": 6, "30d": 29, "90d": 89 };

const dayString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return dayString(date);
};

export default function DateRangeFilter({ value, label = "Date" }: DateRangeFilterProps) {
  const { update, isPending } = useQueryParams<string>();
  const hasRange = Boolean(value.from || value.to);
  const [custom, setCustom] = useState(hasRange);
  const showRange = custom || hasRange;

  const mode = value.preset || (showRange ? CUSTOM : "");
  const active = Boolean(value.preset || hasRange);
  const max = daysAgo(0);

  const choose = (next: string) => {
    if (next === CUSTOM) {
      setCustom(true);
      if (value.preset) update({ preset: null, from: daysAgo(PRESET_DAYS[value.preset] ?? 0), to: daysAgo(0) });
      return;
    }
    setCustom(false);
    update({ preset: next || null, from: null, to: null });
  };

  const setDay = (key: "from" | "to", day: string) => update({ [key]: day || null, preset: null });

  const clear = () => {
    setCustom(false);
    update({ preset: null, from: null, to: null });
  };

  const dateInput = (key: "from" | "to") => (
    <input
      type="date"
      value={value[key]}
      min={key === "to" ? value.from || undefined : undefined}
      max={key === "from" ? value.to || max : max}
      onChange={(event) => setDay(key, event.target.value)}
      disabled={isPending}
      aria-label={`${label} ${key}`}
      className="input w-[9.5rem] py-1.5 text-xs [color-scheme:light] dark:[color-scheme:dark]"
    />
  );

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${isPending ? "opacity-70" : ""}`}>
      <div className="relative">
        <LuCalendarDays className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-500" />
        <select
          value={mode}
          onChange={(event) => choose(event.target.value)}
          disabled={isPending}
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={`input w-auto py-1.5 pl-8 text-xs ${active ? "border-brand-500 text-brand-700 dark:text-brand-300" : ""}`}
        >
          <option value="">{label}: any time</option>
          {DATE_PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
          <option value={CUSTOM}>Custom range...</option>
        </select>
      </div>

      {showRange && !value.preset && (
        <>
          {dateInput("from")}
          <span className="text-xs text-gray-500">to</span>
          {dateInput("to")}
        </>
      )}

      {(active || showRange) && (
        <button
          type="button"
          onClick={clear}
          disabled={isPending}
          className="btn btn-ghost btn-sm btn-icon"
          aria-label="Clear date filter"
          title="Clear date filter"
        >
          <LuX className="size-3.5" />
        </button>
      )}
    </div>
  );
}
