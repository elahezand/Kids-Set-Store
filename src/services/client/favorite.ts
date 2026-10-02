"use client";

import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { ApiSuccess, FavoritePayload, ToggleFavoriteResult } from "@/types";
import { useDelete, usePost } from "./query";
import { getErrorStatus, showErrorToast } from "./errors";

/* Favorites (API: /api/user/favorites — services/server/user/favorite) */

/** POST /user/favorites/toggle -> { isFavorited } */
export const useToggleFavorite = ({
  onChange,
}: { onChange?: (isFavorited: boolean) => void } = {}) => {
  const queryClient = useQueryClient();

  return usePost<ApiSuccess<ToggleFavoriteResult>, FavoritePayload>("/user/favorites/toggle", {
    onSuccess: (response) => {
      const next = Boolean(response.data?.isFavorited);
      onChange?.(next);
      toast.success(next ? "Added to favorites" : "Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
    onError: (error) => showErrorToast(error),
  });
};

/** POST /user/favorites; a 409 means it was already there (still a "yes") */
export const useAddFavorite = ({ onAdded }: { onAdded?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return usePost<ApiSuccess, FavoritePayload>("/user/favorites", {
    onSuccess: () => {
      onAdded?.();
      toast.success("Added to favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
    onError: (error) => {
      if (getErrorStatus(error) === 409) {
        onAdded?.();
        toast.info("Already in your favorites");
        return;
      }
      showErrorToast(error);
    },
  });
};

/** DELETE /user/favorites/:productId (user panel "Remove") */
export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useDelete<ApiSuccess, string>((productId) => `/user/favorites/${productId}`, {
    errorFallback: "Could not remove the product",
    onSuccess: () => {
      toast.success("Removed from favorites");
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
};
