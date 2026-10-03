export interface Pagination {
  limit: number | null;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface FieldError {
  field?: string;
  message: string;
}

export interface ApiSuccess<TData = unknown, TMeta = Record<string, unknown>> {
  success: true;
  message?: string;
  data: TData;
  pagination?: Pagination;
  meta?: TMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: FieldError[];
}

export type ApiResponse<TData = unknown, TMeta = Record<string, unknown>> = ApiSuccess<TData, TMeta> | ApiFailure;

export interface Paginated<TItem, TMeta = Record<string, unknown>> extends ApiSuccess<TItem[], TMeta> {
  pagination: Pagination;
}

export interface ServiceResult<TData = unknown> {
  success: boolean;
  status?: number;
  message?: string;
  data?: TData;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export interface PageProps<TParams extends Record<string, string> = Record<string, string>> {
  params: Promise<TParams>;
  searchParams: Promise<SearchParams>;
}

export type Id = string;
export type ISODate = string;
