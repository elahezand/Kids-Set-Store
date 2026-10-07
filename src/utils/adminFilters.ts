import { firstParam, pickStatus } from "@/utils/searchParams";
import type { SearchParams } from "@/types";

export type AdminListParams = Record<string, string | number>;

export const DATE_PRESETS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

export interface DateFilters {
  preset: DatePreset | "";
  from: string;
  to: string;
}

export interface AdminFilters<T extends string> extends DateFilters {
  status: T | "all";
  q: string;
  /** products only: id of a category (its sub-categories are included) */
  category: string;
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID = /^[a-f\d]{24}$/i;

const readDay = (params: SearchParams, key: string) => {
  const value = firstParam(params[key], 10);
  return DAY.test(value) && !Number.isNaN(new Date(value).getTime()) ? value : "";
};

/** ?preset wins over a custom range; a reversed range (from after to) is swapped */
export const readDateFilters = (params: SearchParams): DateFilters => {
  const preset = DATE_PRESETS.find((item) => item.value === firstParam(params.preset))?.value ?? "";
  if (preset) return { preset, from: "", to: "" };

  const from = readDay(params, "from");
  const to = readDay(params, "to");
  return from && to && from > to ? { preset, from: to, to: from } : { preset, from, to };
};

export const readAdminFilters = <T extends string>(
  params: SearchParams,
  allowed: readonly T[],
  key = "status"
): AdminFilters<T> => {
  const category = firstParam(params.category, 24);
  return {
    status: pickStatus(params, allowed, key),
    q: firstParam(params.q, 100),
    category: OBJECT_ID.test(category) ? category : "",
    ...readDateFilters(params),
  };
};

const clean = (params: Record<string, string | number | undefined>): AdminListParams =>
  Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ""
    )
  );

const tab = <T extends string>(value: T | "all") => (value === "all" ? undefined : value);

const dates = ({ preset, from, to }: DateFilters) => ({ preset, from, to });

/**
 * Tab + search -> API params, one function per list. The server page and the client list use the
 * same object, so the first page rendered on the server matches the pages loaded by "Load more".
 */
export const adminListParams = {
  orders: (limit: number, filters: AdminFilters<string>) => {
    const { status, q } = filters;
    return status === "cash"
      ? clean({ limit, awaitingCash: "true", q, ...dates(filters) })
      : status === "overdue"
        ? clean({ limit, overdueCash: "true", q, ...dates(filters) })
        : clean({ limit, status: tab(status), q, ...dates(filters) });
  },
  products: (limit: number, filters: AdminFilters<string>) =>
    clean({ limit, status: tab(filters.status), q: filters.q, categoryId: filters.category, ...dates(filters) }),
  users: (limit: number, filters: AdminFilters<string>) =>
    clean({ limit, role: tab(filters.status), q: filters.q, ...dates(filters) }),
  comments: (limit: number, filters: AdminFilters<string>) =>
    filters.status === "replied"
      ? clean({ limit, replied: "true", q: filters.q, ...dates(filters) })
      : clean({ limit, status: tab(filters.status), q: filters.q, ...dates(filters) }),
  tickets: (limit: number, filters: AdminFilters<string>) =>
    clean({ limit, status: tab(filters.status), q: filters.q, ...dates(filters) }),
  articles: (limit: number, filters: AdminFilters<string>) =>
    clean({
      limit,
      isPublished: filters.status === "all" ? undefined : String(filters.status === "published"),
      q: filters.q,
      ...dates(filters),
    }),
  coupons: (limit: number, filters: AdminFilters<string>) =>
    clean({
      limit,
      isActive: filters.status === "all" ? undefined : String(filters.status === "active"),
      q: filters.q,
      ...dates(filters),
    }),
  contacts: (limit: number, filters: AdminFilters<string>) =>
    clean({ limit, status: tab(filters.status), q: filters.q, ...dates(filters) }),
  newsletter: (limit: number, filters: AdminFilters<string>) => clean({ limit, q: filters.q, ...dates(filters) }),
  carts: (limit: number, filters: AdminFilters<string>) =>
    clean({ limit, status: tab(filters.status), ...dates(filters) }),
};

export const filtersKey = ({ status, q, category, preset, from, to }: AdminFilters<string>) =>
  [status, q, category, preset, from, to].join("|");

/** true when anything narrows the list — the empty state then says "nothing matches" */
export const isFiltered = ({ q, category, preset, from, to }: AdminFilters<string>) =>
  Boolean(q || category || preset || from || to);

/** Empty-state text when filters hide everything, or null when the list is simply empty */
export const filteredEmptyText = (filters: AdminFilters<string>) =>
  filters.q ? `Nothing matches "${filters.q}".` : isFiltered(filters) ? "Nothing matches these filters." : null;
