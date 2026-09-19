import { AxiosError } from "axios";
import { IPagination } from "../common";

export interface ApiValidationError {
  field: string;
  message: string;
  expected?: string;
  received?: unknown;
}

export interface ApiErrorResponse {
  message: string;
  errors?: ApiValidationError[];
  statusCode?: number;
}

export type ApiError = AxiosError<ApiErrorResponse>;

export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

/**
 * Canonical shape for every paginated list endpoint in the backend:
 * `res.status(200).json({ success: true, data: [...], pagination })`.
 * Do NOT nest another `data` layer inside `data` — the backend always
 * returns the array directly at the top level next to `pagination`.
 */
export type PaginatedResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination?: IPagination;
};
