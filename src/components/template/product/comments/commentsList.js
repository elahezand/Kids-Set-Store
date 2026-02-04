import React, { useState } from 'react'
import Comment from '@/components/modules/comment/comment';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import qs from "qs";
export default function CommentsList({ data: initialData, nextCursor, limit }) {
    const [comments, setComments] = useState(initialData);
    const [cursor, setCursor] = useState(nextCursor)
    const [loading, setLoading] = useState(false);

    let queryString = qs.stringify({ cursor, limit },
        { encode: false, });

    const queryKey = [`/api/comments-${queryString}`]
    const { refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axios.get(`/api/comments?${queryString}`);
            return data;
        },
    });

    const loadMore = async () => {
        setLoading(true);
        const res = await refetch();

        setComments(prev => [...prev, ...res.data.data]);
        setCursor(res.data.nextCursor)
        setLoading(false);
    };
    return (
        <>
            <div>
                {comments.filter(comment => comment.isAccept)
                    .map((comment, index) => (
                        <Comment key={index + 1} {...comment} />
                    ))}
            </div>
            {cursor && (
                <div className="mt-5 col-12">
                    <button onClick={loadMore}
                        className="classic w-100"
                        disabled={loading}>
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    )
}
