"use client"
import React from 'react'
import qs from "qs"
import axios from 'axios'
import Article from '../index/articles/article'
import { useInfiniteQuery } from '@tanstack/react-query'
import styles from "@/components/template/index/latest/latest.module.css"

export const metadata = {
  title: "Our Articles | My Website",
  description: "Read our latest articles, news, and insights on various topics.",
  openGraph: {
    title: "Our Articles | My Website",
    description: "Read our latest articles, news, and insights on various topics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Articles | My Website",
    description: "Read our latest articles, news, and insights on various topics.",
  },
}
export default function ArticlesList({ data: initialData, limit, nextCursor }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["articles"],
    queryFn: async ({ pageParam = null }) => {
      const queryString = qs.stringify({ cursor: pageParam, limit }, { encode: false });
      const { data } = await axios.get(`/api/articles?${queryString}`);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialData: {
      pages: [{ data: initialData, nextCursor }],
      pageParams: [null],
    }
  });

  return (
    <>
      <div data-aos="fade-up" style={{ display: "flex", gap: "1rem" }}>
        {data?.pages?.flatMap((page) =>
          page.data.map((item) => <Article {...item} key={item._id} />)
        ) || <div className={styles.no_products}>Not Found</div>}
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