"use client";

import { toast } from "sonner";
import type { ApiSuccess, CreateCommentPayload, Paginated, ProductComment } from "@/types";
import { queryKeys } from "./keys";
import { useInfiniteGet, usePost } from "./query";

/* Product reviews (API: /api/comments/product/:id, /api/user/comment) */

export const useProductComments = (
  productId: string,
  { limit = 5, initialPage }: { limit?: number; initialPage?: Paginated<ProductComment> } = {}
) =>
  useInfiniteGet<ProductComment>(`/comments/product/${productId}`, { limit }, {
    queryKey: queryKeys.comments(productId),
    errorFallback: "Could not load reviews",
    initialPage,
    staleTime: 60 * 1000,
  });

export const useCreateComment = ({ onCreated }: { onCreated?: () => void } = {}) =>
  usePost<ApiSuccess<ProductComment>, CreateCommentPayload>("/user/comment", {
    errorFallback: "Failed to send review",
    onSuccess: () => {
      toast.success("Thanks! Your review will appear after approval.");
      onCreated?.();
    },
  });
