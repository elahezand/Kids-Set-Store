"use client";

import Comment from "@/components/modules/main/comment";
import { useInfiniteGet } from "@/utils/hooks/useReactQuery";

/* GET /api/comments/product/:product -> { success, data, pagination: { nextCursor, hasMore } } */
export default function CommentsList({
    data: initialData = [],
    nextCursor = null,
    limit = 5,
    productId,
}) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useInfiniteGet(
            `/comments/product/${productId}`,
            { limit },
            {
                queryKey: ["comments", productId],
                errorFallback: "Could not load reviews",
                initialData: {
                    pages: [
                        {
                            data: initialData,
                            pagination: { nextCursor, hasMore: Boolean(nextCursor) },
                        },
                    ],
                    pageParams: [null],
                },
                staleTime: 60 * 1000,
            }
        );

    const comments = data?.pages?.flatMap((page) => page.data ?? []) ?? [];

    return (
        <>
            <div>
                {comments.map((comment) => (
                    <Comment key={String(comment._id ?? comment.id)} {...comment} />
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
