"use client"
import React from 'react'
import Comment from '@/components/modules/comment/comment';
import axios from "axios";
import { useInfiniteQuery } from '@tanstack/react-query';
import qs from "qs";
export default function CommentsList({ data: initialData, nextCursor, limit, productId }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["comments", productId],
        queryFn: async ({ pageParam = null }) => {
            const queryString = qs.stringify(
                { cursor: pageParam, limit, productId },
                { encode: false }
            );

            const { data } = await axios.get(`/api/comments?${queryString}`);
            return data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,

        initialData: {
            pages: [{ data: initialData, nextCursor }],
            pageParams: [null],
        },
        staleTime: 1000 * 60 * 60,
    });

    return (
        <>
            <div>
                {data?.pages?.flatMap((page) =>
                    page.data.map((comment) => (
                        <Comment key={comment._id} {...comment} />
                    )))}
            </div>
            {hasNextPage && (
                <div className="loadMoreBtn">
                    <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    )
}
