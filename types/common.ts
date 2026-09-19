export interface IPagination {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}
