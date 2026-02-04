"use client"
import React from 'react'
import { useState } from 'react';
import qs from "qs"
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Product from '@/components/modules/product/product'
import styles from "@/components/template/index/latest/latest.module.css"
import FilterSection from './filterSection';
import { json } from 'zod';
export default function ProductsList({ data: initialData, categoryName, limit, nextCursor, categories, value }) {
    const [products, setProducts] = useState(initialData);
    const [loading, setLoading] = useState(false);

    let queryString = null

    const [params, setParams] = useState({
        category: categoryName,
        min: "",
        max: "",
        value: value,
        cursor: nextCursor,
        limit
    })

    queryString = qs.stringify(params,
        { encode: false, });

    const queryKey = [`/api/products-${queryString}`]

    const { refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axios.get(`/api/products?${queryString}`);
            return data;
        },
    });

    const loadMore = async () => {
        setLoading(true);
        const res = await refetch();

        setProducts(prev => [...prev, ...res.data.data]);
        setParams(prev => prev = { ...prev, cursor: res.data.nextCursor })
        setLoading(false);
    };

    return (
        <>
            {/*filtring*/}
            <FilterSection
                categories={JSON.parse(JSON.stringify(categories))}
                data={products}
                setProducts={setProducts}
            />
            <main data-aos="fade-up" className={styles.products}>
                {products.length ? products.map((item, index) => (
                    <Product
                        {...item}
                        key={index + 1} />
                )) : null}
            </main>
            {params.cursor && (
                <div className="loadmore">
                    <button onClick={loadMore}
                        disabled={loading}>
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    )
}
