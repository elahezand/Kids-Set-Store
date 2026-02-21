"use client"
import React, { useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import qs from "qs"
import axios from 'axios'
import Product from '@/components/modules/product/product'
import styles from "@/components/template/index/latest/latest.module.css"
import FilterSection from './filterSection'
import { useInfiniteQuery } from '@tanstack/react-query'

export default function ProductsList({
    data: initialData,
    categoryName,
    limit,
    nextCursor,
    categories,
    value
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();


    const currentFilters = useMemo(() => ({
        category: searchParams.get("category") || categoryName || "",
        min: searchParams.get("min") || "",
        max: searchParams.get("max") || "",
        color: searchParams.get("color") || "",
        material: searchParams.get("material") || "",
        sort: searchParams.get("sort") || "",
        value,
    }), [searchParams, categoryName, value]);

    const hasFilters = Object.values(currentFilters).some(v => v && v !== "");
    const queryString = searchParams.toString()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["products", queryString],
     
        queryFn: async ({ pageParam = null }) => {
            const cleanParams = Object.fromEntries(
                Object.entries({ ...currentFilters, cursor: pageParam, limit })
                    .filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "-1")
            );
            const res = await axios.get(`/api/products?${qs.stringify(cleanParams, { encode: false })}`);
            return res.data;
        },

        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

        ...(!hasFilters && {
            initialData: {
                pages: [{ data: initialData, nextCursor }],
                pageParams: [null],
            }
        }),

        staleTime: 1000 * 60 * 5,
    });

    const handleFilterChange = (newFilterParams) => {
        const cleanParams = Object.fromEntries(
            Object.entries({ ...currentFilters, ...newFilterParams })
                .filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "-1")
        );

        const queryString = qs.stringify(cleanParams, { encode: false });
        router.push(`${pathname}?${queryString}`);
    };


    return (
        <>
            <FilterSection
                categories={categories}
                onFilterChange={handleFilterChange}
                currentParams={currentFilters}
            />

            <div data-aos="fade-up" className={styles.products}>
                {data?.pages?.flatMap((page) =>
                    page.data.map((item) => (
                        <Product {...item} key={item._id} />
                    )
                    ))}

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