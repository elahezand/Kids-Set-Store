"use client"
import React, { useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import qs from "qs"
import axios from 'axios'
import Product from '@/components/modules/product/product'
import styles from "@/components/template/index/latest/latest.module.css"
import FilterSection from './filterSection'
import { useQuery } from '@tanstack/react-query'
import Pagination from '@/components/modules/pageination/pagination'

export default function ProductsList({
    categoryName,
    categories,
    value
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;

    const currentFilters = useMemo(() => ({
        category: searchParams.get("category") || categoryName || "",
        min: searchParams.get("min") || "",
        max: searchParams.get("max") || "",
        color: searchParams.get("color") || "",
        material: searchParams.get("material") || "",
        sort: searchParams.get("sort") || "",
        page: currentPage,
        limit: searchParams.get("limit") || 15,
        value,
    }), [searchParams, categoryName, value, currentPage]);


    const { data } = useQuery({
        queryKey: ["products", currentFilters],
        queryFn: async () => {
            const cleanParams = Object.fromEntries(
                Object.entries(currentFilters)
                    .filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "-1")
            );
            const res = await axios.get(`/api/products`, { params: cleanParams });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const handleFilterChange = (newFilterParams) => {
        const updatedFilters = { ...currentFilters, ...newFilterParams, page: 1 };
        const cleanParams = Object.fromEntries(
            Object.entries(updatedFilters)
                .filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "-1")
        );

        const queryString = qs.stringify(cleanParams, { encode: false });
        router.push(`${pathname}?${queryString}`, { scroll: true });
    };

    const getPaginationHref = () => {
        const params = Object.fromEntries(searchParams.entries());
        delete params.page;
        const baseQuery = qs.stringify(params, { encode: false });
        return `${pathname}?${baseQuery}`;
    };    

    return (
        <>
            <FilterSection
                categories={categories}
                onFilterChange={handleFilterChange}
                currentParams={currentFilters}
            />

            <div data-aos="fade-up" className={styles.products}>
                {(data?.data || data?.pages?.[0]?.data)?.map((item) => (
                    <Product {...item} key={item._id} />
                ))}
            </div>

            <Pagination
                href={getPaginationHref()}
                currentPage={currentPage}
                pageCount={data?.pageCount}
            />
        </>
    )
}