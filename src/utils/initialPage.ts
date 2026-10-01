import { toPlain } from "@/utils/format";
import type { Paginated, Pagination } from "@/types";

export const toInitialPage = <TItem>(
  result: { data?: TItem[]; pagination?: Partial<Pagination> } | null | undefined,
  limit: number
): Paginated<TItem> =>
  toPlain({
    success: true as const,
    data: result?.data ?? [],
    pagination: {
      limit,
      nextCursor: result?.pagination?.nextCursor ?? null,
      hasMore: Boolean(result?.pagination?.hasMore),
    },
  });
