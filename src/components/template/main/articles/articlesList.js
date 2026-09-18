"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HiChevronDown } from "react-icons/hi";
import Article from "../index/articles/article";

export default function ArticlesList({
    data: initialData = [],
    nextCursor = null,
    hasMore = false,
    limit = 9,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [articles, setArticles] = useState(initialData);
    const lastBatch = useRef(initialData);

    useEffect(() => {
        if (lastBatch.current === initialData) return;
        lastBatch.current = initialData;

        setArticles((current) => {
            const seen = new Set(current.map((item) => String(item._id)));
            return [...current, ...initialData.filter((item) => !seen.has(String(item._id)))];
        });
    }, [initialData]);

    const loadMore = () => {
        if (!nextCursor || !hasMore || isPending) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("cursor", nextCursor);

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    if (!articles.length) {
        return (
            <p className="py-16 text-center text-gray-700 dark:text-gray-500">
                No articles found.
            </p>
        );
    }

    return (
        <>
            <div data-aos="fade-up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((item) => (
                    <Article {...item} key={String(item._id)} />
                ))}
            </div>

            {hasMore && (
                <div className="mt-10 flex w-full justify-center">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isPending}
                        className="btn btn-lg btn-secondary w-full rounded-full sm:w-auto sm:px-10"
                    >
                        <span>{isPending ? "Loading..." : "Load more"}</span>
                        <HiChevronDown className={`size-5 ${isPending ? "animate-bounce" : ""}`} />
                    </button>
                </div>
            )}

            {!hasMore && articles.length > limit && (
                <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-500">
                    You have seen all {articles.length} articles.
                </p>
            )}
        </>
    );
}