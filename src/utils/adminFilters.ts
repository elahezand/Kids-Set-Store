import { firstParam, pickStatus } from "@/utils/searchParams";
import type { SearchParams } from "@/types";

export type AdminListParams = Record<string, string | number>;

export interface AdminFilters<T extends string> {
  status: T | "all";
  q: string;
}

export const readAdminFilters = <T extends string>(
  params: SearchParams,
  allowed: readonly T[],
  key = "status"
): AdminFilters<T> => ({
  status: pickStatus(params, allowed, key),
  q: firstParam(params.q, 100),
});

const clean = (params: Record<string, string | number | undefined>): AdminListParams =>
  Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== ""
    )
  );

const tab = <T extends string>(value: T | "all") => (value === "all" ? undefined : value);

/**
 * Tab + search -> API params, one function per list. The server page and the client list use the
 * same object, so the first page rendered on the server matches the pages loaded by "Load more".
 */
export const adminListParams = {
  orders: (limit: number, { status, q }: AdminFilters<string>) =>
    status === "cash"
      ? clean({ limit, awaitingCash: "true", q })
      : status === "overdue"
        ? clean({ limit, overdueCash: "true", q })
        : clean({ limit, status: tab(status), q }),
  products: (limit: number, { status, q }: AdminFilters<string>) => clean({ limit, status: tab(status), q }),
  users: (limit: number, { status, q }: AdminFilters<string>) => clean({ limit, role: tab(status), q }),
  comments: (limit: number, { status, q }: AdminFilters<string>) =>
    status === "replied" ? clean({ limit, replied: "true", q }) : clean({ limit, status: tab(status), q }),
  tickets: (limit: number, { status, q }: AdminFilters<string>) => clean({ limit, status: tab(status), q }),
  articles: (limit: number, { status, q }: AdminFilters<string>) =>
    clean({ limit, isPublished: status === "all" ? undefined : String(status === "published"), q }),
  coupons: (limit: number, { status, q }: AdminFilters<string>) =>
    clean({ limit, isActive: status === "all" ? undefined : String(status === "active"), q }),
};

export const filtersKey = ({ status, q }: AdminFilters<string>) => `${status}|${q}`;
