"use client";

import Comment from "@/components/modules/main/comment";
import { useProductComments } from "@/services/client/comment";
import type { Paginated, ProductComment } from "@/types";

interface CommentsListProps {
  productId: string;
  /** first page, rendered on the server with the same service as the API route */
  initialPage: Paginated<ProductComment>;
  limit?: number;
}

export default function CommentsList({ productId, initialPage, limit = 5 }: CommentsListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductComments(productId, {
    limit,
    initialPage,
  });

  const comments = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <>
      <div>
        {comments.map((comment) => (
          <Comment key={String(comment._id)} {...comment} />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn btn-accent w-full sm:w-auto sm:min-w-60"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
