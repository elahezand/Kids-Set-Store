"use client"
import React from 'react'
import Product from "@/components/modules/product/product";
import styles from "@/styles/wishList.module.css";
import Link from "next/link";
import { publicApi } from '@/utils/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FaRegHeart } from "react-icons/fa";
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
            <main className={styles.container} data-aos="fade-up">
                {favorites.map((wish, index) =>
                    <Product
                        key={index}
                        {...wish} />)}
                {hasNextPage && (
                    <div className="mt-5 col-12">
                        <button
                            onClick={() => fetchNextPage()}
                            className="classic w-100"
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? "Loading..." : "Load more"}
                        </button>
                    </div>
                )}
            </main>
            {favorites.length === 0 && (
                <div className={styles.wishlist_empty} data-aos="fade-up">
                    <FaRegHeart />
                    <p> No Product Found</p>
                    <span>You Do NOT Have Any Products In Your Favorites List Yet :(</span>
                    <span>You Will Find Lots Of Interstingg Products On The Home Page</span>
                    <div>
                        <Link href="/products">Back TO Shop</Link>
                    </div>
                </div>
            )}

        </>
    )
}
