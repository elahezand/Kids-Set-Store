
"use client";

import React from "react";
import Comment from "@/components/modules/main/comment";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import qs from "qs";

export default function CommentsList({
    data: initialData,
    nextCursor,
    limit,
    productId,
}) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["comments", productId],

        queryFn: async ({ pageParam }) => {
            const queryString = qs.stringify(
                {
                    cursor: pageParam,
                    limit,
                },
                {
                    encode: false,
                    skipNulls: true,
                }
            );

            const response = await axios.get(
                `/api/comments/product/${productId}?${queryString}`
            );

            return {
                data: response.data.data,
                nextCursor:
                    response.data.pagination?.nextCursor ?? null,
            };
        },

        initialPageParam: null,

        getNextPageParam: (lastPage) =>
            lastPage.nextCursor ?? undefined,

        initialData: {
            pages: [
                {
                    data: initialData,
                    nextCursor: nextCursor ?? null,
                },
            ],
            pageParams: [null],
        },

        staleTime: 1000 * 60 * 60,
    });

    const comments =
        data?.pages?.flatMap((page) => page.data) ?? [];

    return (
        <>
            <div>
                {comments.map((comment) => (
                    <Comment
                        key={comment._id}
                        {...comment}
                    />
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
                        {isFetchingNextPage
                            ? "Loading..."
                            : "Load more"}
                    </button>
                </div>
            )}
        </>
    );
}
