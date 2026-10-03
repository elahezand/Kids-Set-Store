"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/services/client/errors";
import { queryKeys } from "@/services/client/keys";
import { useDelete, useGet, usePost } from "@/services/client/query";
import type { ApiSuccess, FavoritePayload, ToggleFavoriteResult } from "@/types";

type CountResponse = ApiSuccess<{ count: number }>;

export const useFavoriteCount = ({ enabled, initialCount }: { enabled: boolean; initialCount: number }) =>
  useGet<CountResponse>("/user/favorites/count", undefined, {
    queryKey: queryKeys.favoriteCount,
    enabled,
    silentError: true,
    axiosConfig: { silentAuth: true },
    initialData: { success: true, data: { count: initialCount } },
  });

const bumpFavoriteCount = (queryClient: QueryClient, delta: number) =>
  queryClient.setQueryData<CountResponse>(queryKeys.favoriteCount, (old) =>
    old ? { ...old, data: { count: Math.max(0, (old.data?.count ?? 0) + delta) } } : old
  );

type IdsResponse = ApiSuccess<string[]>;

export const useFavoriteIds = () => {
  const { data } = useGet<IdsResponse>("/user/favorites/ids", undefined, {
    queryKey: queryKeys.favoriteIds,
    silentError: true,
    retry: false,
    axiosConfig: { silentAuth: true },
  });
  const ids = useMemo(() => new Set(data?.data ?? []), [data]);
  return { ids, isLoaded: Boolean(data) };
};

const setFavoriteId = (queryClient: QueryClient, productId: string, liked: boolean) =>
  queryClient.setQueryData<IdsResponse>(queryKeys.favoriteIds, (old) => {
    const ids = new Set(old?.data ?? []);
    if (liked) ids.add(productId);
    else ids.delete(productId);
    return { success: true, ...old, data: [...ids] };
  });

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return usePost<ApiSuccess<ToggleFavoriteResult>, FavoritePayload>("/user/favorites/toggle", {
    onSuccess: (response, { productId }) => {
      const liked = Boolean(response.data?.isFavorited);
      setFavoriteId(queryClient, productId, liked);
      bumpFavoriteCount(queryClient, liked ? 1 : -1);
      toast.success(liked ? "Added to favorites" : "Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
    onError: (error) => showErrorToast(error),
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useDelete<ApiSuccess, string>((productId) => `/user/favorites/${productId}`, {
    errorFallback: "Could not remove the product",
    onSuccess: (_response, productId) => {
      setFavoriteId(queryClient, productId, false);
      bumpFavoriteCount(queryClient, -1);
      toast.success("Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
};
