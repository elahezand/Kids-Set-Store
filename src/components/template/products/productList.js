"use client"
import React, { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import qs from "qs"
import axios from 'axios'
import Product from '@/components/modules/product/product'
import styles from "@/components/template/index/latest/latest.module.css"
import FilterSection from './filterSection'

export default function ProductsList({ data: initialData, categoryName, limit, nextCursor, categories, value }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const [params, setParams] = useState({
        category: searchParams.get("category") || categoryName || "",
        min: searchParams.get("min") || "",
        max: searchParams.get("max") || "",
        color: searchParams.get("color") || "",
        material: searchParams.get("material") || "",
        sort: searchParams.get("sort") || "",
        value: value,
        cursor: nextCursor,
        limit
    });

    const fetchData = async (currentParams) => {
        const cleanParams = Object.fromEntries(
            Object.entries(currentParams).filter(([_, value]) =>
                value !== "" && value !== null && value !== undefined
            ));

        const { data } = await axios.get(`/api/products?${qs.stringify(cleanParams, { encode: false })}`);
        return data;
    };

    const handleFilterChange = async (newFilterParams) => {
        const updatedParams = { ...params, ...newFilterParams, cursor: null };
        setParams(updatedParams);

        const filteredParams = Object.fromEntries(
            Object.entries(updatedParams).filter(([_, val]) => val !== "" && val !== null && val !== undefined && val !== "-1")
        );

        const queryString = qs.stringify(filteredParams, { encode: false });
        const url = queryString ? `${pathname}?${queryString}` : pathname;

        router.push(url, { scroll: false });

        const res = await fetchData(updatedParams);
        if (res) {
            setProducts(res.data);
            setParams(prev => ({ ...prev, cursor: res.nextCursor }));
        }
        setLoading(false);
    };

    const loadMore = async () => {
        if (!params.cursor || loading) return;
        setLoading(true);
        const res = await fetchData(params);
        if (res) {
            setProducts(prev => [...prev, ...res.data]);
            setParams(prev => ({ ...prev, cursor: res.nextCursor }));
        }
        setLoading(false);
    };


    return (
        <>
            <FilterSection
                categories={categories}
                onFilterChange={handleFilterChange}
                currentParams={params}
            />

            <div data-aos="fade-up" className={styles.products}>
                {products?.length > 0 ? products.map((item, index) => (
                    <Product {...item} key={index} />
                )) : (
                    <div className={styles.no_products}> Not Found </div>
                )}
            </div>
            {params.cursor && (
                <div className={styles.loadmore_container}>
                    <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    )
}