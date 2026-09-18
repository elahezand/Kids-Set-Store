"use client";

"use client";

import {
    useState,
    useEffect,
    useRef,
    useTransition,
} from "react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { HiChevronDown } from "react-icons/hi";
import Product from "@/components/modules/main/product";

export default function ProductList({
    initialProducts = [],
    initialCursor = null,
    initialHasMore = false,
    limit = 6,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [products, setProducts] = useState(initialProducts);
    const lastBatch = useRef(initialProducts);

    useEffect(() => {
        if (lastBatch.current === initialProducts) return;
        lastBatch.current = initialProducts;

        setProducts((current) => {
            const seen = new Set(current.map((item) => String(item._id)));
            return [...current, ...initialProducts.filter((item) => !seen.has(String(item._id)))];
        });
    }, [initialProducts]);

    const loadMore = () => {
        if (!initialCursor || !initialHasMore || isPending) return;

        const params = new URLSearchParams(searchParams.toString());
        params.set("cursor", initialCursor);

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    if (!products.length) {
        return (
            <p className="py-16 text-center text-gray-700 dark:text-gray-500">
                No products match your filters.
            </p>
        );
    }

    return (
        <>
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {products.map((item) => (
                    <Product key={String(item._id)} {...item} />
                ))}
            </div>

            {initialHasMore && (
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

            {!initialHasMore && products.length > limit && (
                <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-500">
                    You have seen all {products.length} products.
                </p>
            )}
        </>
    );
}