"use client";

import { useMemo } from "react";
import {
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { showErrorToast } from "@/services/client/errors";
import http, { type AxiosRequestConfig } from "@/services/client/http";
import type { ApiSuccess, Paginated } from "@/types";

type HttpMethod = "post" | "patch" | "put" | "delete";

export interface GetOptions<TResponse> extends Omit<
  UseQueryOptions<TResponse, Error, TResponse, QueryKey>,
  "queryKey" | "queryFn"
> {
  queryKey?: QueryKey;
  axiosConfig?: AxiosRequestConfig;
  silentError?: boolean;
  errorFallback?: string;
}

export const useGet = <TResponse = ApiSuccess>(
  url: string,
  params?: Record<string, unknown>,
  options: GetOptions<TResponse> = {}
) => {
  const { axiosConfig, silentError, errorFallback, queryKey, ...queryOptions } = options;

  return useQuery<TResponse, Error, TResponse, QueryKey>({
    queryKey: queryKey ?? [url, params],
    queryFn: async () => {
      try {
        const { data } = await http.get<TResponse>(url, {
          ...axiosConfig,
          params,
          paramsSerializer: { indexes: null },
        });
        return data;
      } catch (error) {
        if (!silentError) showErrorToast(error, errorFallback || "Failed to load data");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    ...queryOptions,
  });
};

export interface InfiniteOptions<TItem> {
  queryKey?: QueryKey;
  silentError?: boolean;
  errorFallback?: string;
  staleTime?: number;
  enabled?: boolean;
  initialPage?: Paginated<TItem>;
}

export const useInfiniteGet = <TItem>(
  url: string,
  params: Record<string, unknown> = {},
  options: InfiniteOptions<TItem> = {}
) => {
  const { queryKey, silentError, errorFallback, initialPage, ...rest } = options;

  return useInfiniteQuery({
    queryKey: queryKey ?? [url, params],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      try {
        const { data } = await http.get<Paginated<TItem>>(url, {
          params: { ...params, ...(pageParam ? { cursor: pageParam } : {}) },
          paramsSerializer: { indexes: null },
        });
        return data;
      } catch (error) {
        if (!silentError) showErrorToast(error, errorFallback || "Failed to load data");
        throw error;
      }
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: Paginated<TItem>) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    ...(initialPage ? { initialData: { pages: [initialPage], pageParams: [null] } } : {}),
    staleTime: 5 * 60 * 1000,
    ...rest,
  });
};

const flattenPages = <TItem>(pages?: Array<Paginated<TItem>>) => pages?.flatMap((page) => page.data ?? []) ?? [];

export const useCursorList = <TItem>(
  url: string,
  key: readonly unknown[],
  params: Record<string, unknown>,
  initialPage: Paginated<TItem>,
  errorFallback: string
) => {
  const result = useInfiniteGet<TItem>(url, params, { queryKey: key, initialPage, errorFallback });
  const items = useMemo(() => flattenPages(result.data?.pages), [result.data]);
  return { ...result, items };
};

export interface MutationOptions<TResponse, TVariables> extends Omit<
  UseMutationOptions<TResponse, unknown, TVariables>,
  "mutationFn"
> {
  axiosConfig?: AxiosRequestConfig;
  errorFallback?: string;
}

const createMutationHook =
  (method: HttpMethod) =>
  <TResponse = ApiSuccess, TVariables = unknown>(
    url: string | ((variables: TVariables) => string),
    options: MutationOptions<TResponse, TVariables> = {}
  ) => {
    const { axiosConfig, errorFallback, ...mutationOptions } = options;

    return useMutation<TResponse, unknown, TVariables>({
      mutationFn: async (variables) => {
        const target = typeof url === "function" ? url(variables) : url;

        if (method === "delete") {
          const { data } = await http.delete<TResponse>(target, {
            ...axiosConfig,
            ...(typeof url !== "function" && variables && typeof variables === "object" ? { data: variables } : {}),
          });
          return data;
        }

        const { data } = await http[method]<TResponse>(target, variables, axiosConfig);
        return data;
      },
      onError: (error) => showErrorToast(error, errorFallback || "Something went wrong"),
      ...mutationOptions,
    });
  };

export const usePost = createMutationHook("post");
export const usePatch = createMutationHook("patch");
export const usePut = createMutationHook("put");
export const useDelete = createMutationHook("delete");
