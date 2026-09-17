"use client"
import qs from "qs"
import axios from 'axios'
import Article from '../index/articles/article'
import { useInfiniteQuery } from '@tanstack/react-query'

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

  const items = data?.pages?.flatMap((page) => page.data) || [];

  return (
    <>
      <div data-aos="fade-up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.length
          ? items.map((item) => <Article {...item} key={item._id} />)
          : <div className="col-span-full py-10 text-center text-text dark:text-gray-100">Not Found</div>
        }
      </div>

      {hasNextPage && (
        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="btn btn-accent"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  )
}
