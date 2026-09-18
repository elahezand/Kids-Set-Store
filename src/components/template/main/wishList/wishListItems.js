"use client";

import {
    useState,
    useEffect,
    useRef,
} from "react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import Product from "@/components/modules/main/product";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import { HiChevronDown } from "react-icons/hi";

export default function WishListItems({
    initialWishlists = [],
    initialCursor = null,
    initialHasMore = false,
    limit = 6,
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(false);

    const normalizedInitialWishlists = initialWishlists.flat();

    const [wishLists, setWishlists] = useState(
        normalizedInitialWishlists
    );

    const lastBatch = useRef(initialWishlists);

    useEffect(() => {
        if (lastBatch.current === initialWishlists) return;

        lastBatch.current = initialWishlists;

        const newProducts = initialWishlists.flat();

        setWishlists((current) => {
            const seen = new Set(
                current.map((item) => String(item._id))
            );

            return [
                ...current,
                ...newProducts.filter(
                    (item) => !seen.has(String(item._id))
                ),
            ];
        });
    }, [initialWishlists]);

    const loadMore = () => {
        if (!initialCursor || !initialHasMore || isLoading) return;

        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.set("cursor", initialCursor);

        setIsLoading(true);

        router.push(`?${params.toString()}`, {
            scroll: false,
        });
    };

    useEffect(() => {
        if (isLoading) {
            setIsLoading(false);
        }
    }, [initialWishlists]);

    if (!wishLists.length) {
        return (
            <div
                className="py-8 text-center leading-tight text-text dark:text-gray-100"
                data-aos="fade-up"
            >
                <FaRegHeart className="mx-auto text-[7rem] text-sage-300 sm:text-[9rem] md:text-[10rem]" />

                <p className="mb-3 mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
                    No Product Found
                </p>

                <span className="mb-1.5 block text-gray-600 dark:text-gray-400">
                    You Do NOT Have Any Products In Your Favorites List Yet :(
                </span>

                <span className="mb-8 block text-gray-600 dark:text-gray-400">
                    You Will Find Lots Of Interesting Products On The Home Page
                </span>

                <div>
                    <Link
                        href="/products"
                        className="btn btn-accent"
                    >
                        Back TO Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {wishLists.map((item) => (
                    <Product
                        key={String(item._id)}
                        {...item}
                    />
                ))}
            </div>

            {initialHasMore && (
                <div className="mt-10 flex w-full justify-center">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="btn btn-lg btn-secondary w-full rounded-full sm:w-auto sm:px-10"
                    >
                        <span>
                            {isLoading
                                ? "Loading..."
                                : "Load more"}
                        </span>

                        <HiChevronDown
                            className={`size-5 ${
                                isLoading
                                    ? "animate-bounce"
                                    : ""
                            }`}
                        />
                    </button>
                </div>
            )}

            {!initialHasMore &&
                wishLists.length > limit && (
                    <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-500">
                        You have seen all {wishLists.length} products.
                    </p>
                )}
        </>
    );
}
