"use client"
import Product from "@/components/modules/main/product";
import Link from "next/link";
import { publicApi } from '@/utils/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FaRegHeart } from "react-icons/fa";
import qs from "qs";

export default function WishListItems({ data: initialData, limit, nextCursor }) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["favorites"],
        queryFn: async ({ pageParam = null }) => {
            const queryString = qs.stringify({ cursor: pageParam, limit }, { encode: false });
            const { data } = await publicApi.get(`/api/favorites?${queryString}`);
            return data;
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        initialData: {
            pages: [{ data: initialData, nextCursor }],
            pageParams: [null],
        }
    });

    const favorites = data?.pages?.flatMap(page => page.data) || [];

    return (
        <>
            <main className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 xl:grid-cols-5" data-aos="fade-up">
                {favorites.map((wish, index) => <Product key={index} {...wish} />)}
                {hasNextPage && (
                    <div className="col-span-full mt-4">
                        <button
                            onClick={() => fetchNextPage()}
                            className="btn btn-accent w-full"
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? "Loading..." : "Load more"}
                        </button>
                    </div>
                )}
            </main>
            {favorites.length === 0 && (
                <div className="py-8 text-center leading-tight text-text dark:text-gray-100" data-aos="fade-up">
                    <FaRegHeart className="mx-auto text-[7rem] text-sage-300 sm:text-[9rem] md:text-[10rem]" />
                    <p className="mb-3 mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">No Product Found</p>
                    <span className="mb-1.5 block text-gray-600 dark:text-gray-400">You Do NOT Have Any Products In Your Favorites List Yet :(</span>
                    <span className="mb-8 block text-gray-600 dark:text-gray-400">You Will Find Lots Of Interstingg Products On The Home Page</span>
                    <div>
                        <Link href="/products" className="btn btn-accent">
                            Back TO Shop
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}
