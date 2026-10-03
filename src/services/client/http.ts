"use client";

import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

declare module "axios" {
  interface AxiosRequestConfig {
    skipRefresh?: boolean;
    silentAuth?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

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
    refreshPromise = http.post("/auth/refresh", {}, { skipRefresh: true }).finally(() => {
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

export default http;
