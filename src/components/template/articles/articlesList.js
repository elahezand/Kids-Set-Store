"use client"
import React, { useState } from 'react'
import qs from "qs"
import axios from 'axios'
import Article from '../index/articles/article'
import { useQuery } from '@tanstack/react-query'
import styles from "@/components/template/index/latest/latest.module.css"

export default function ArticlesList({ data: initialData, limit, nextCursor }) {
    const [articles, setArticles] = useState(initialData);
    const [cursor, setCursor] = useState(nextCursor)
    const [loading, setLoading] = useState(false);

    let queryString = qs.stringify({ cursor, limit },
        { encode: false, });

    const queryKey = [`/api/articles-${queryString}`]
    const { refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await axios.get(`/api/articles?${queryString}`);
            return data;
        },
    });

    const loadMore = async () => {
        setLoading(true);
        const res = await refetch();

        setArticles(prev => [...prev, ...res.data.data]);
        setCursor(res.data.nextCursor)
        setLoading(false);
    };

    return (
        <>

            <div data-aos="fade-up" style={{display:"flex", gap:"1rem"}}>
                {articles?.length > 0 ? articles.map((item, index) => (
                    <Article {...item} key={index} />
                )) : (
                    <div className={styles.no_products}> Not Found </div>
                )}
            </div>
            {cursor && (
                <div className={styles.loadmore_container}>
                    <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
                        {loading ? "Loading..." : "Load more"}
                    </button>
                </div>
            )}
        </>
    )
}