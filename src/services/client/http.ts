"use client";

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

/*
  Browser HTTP client for the main site. Every client service (services/client/*) goes
  through it. On a 401 it refreshes the access token once (POST /auth/refresh) and
  retries the request.

  per-request options:
    skipRefresh  - public auth routes: a 401 is a real answer, do not refresh
    silentAuth   - do not toast "Please log in" when the refresh fails (background calls)
*/

declare module "axios" {
  interface AxiosRequestConfig {
    skipRefresh?: boolean;
    silentAuth?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** error raised after the refresh failed; the user already saw a toast */
export interface AuthError extends Error {
  _authToastShown?: boolean;
}

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

let refreshPromise: Promise<unknown> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = http
      .post("/auth/refresh", {}, { skipRefresh: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    if (!original || original.skipRefresh) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        await refreshAccessToken();
        return http.request(original);
      } catch (refreshError) {
        if (!original.silentAuth) toast.error("Please log in");
        if (refreshError instanceof Error) {
          (refreshError as AuthError)._authToastShown = true;
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export type { AxiosRequestConfig };

// old name used by the panels
export const api = http;
export default http;
