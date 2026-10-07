"use client";

import Article from "@/components/modules/main/article/articleCard";
import LoadMore from "@/components/modules/main/loadMore";
import { useArticleListing } from "@/services/client/listing";
import type { ArticleListQuery, ArticleSummary, Paginated } from "@/types";

interface ArticlesListProps {
  query: ArticleListQuery;
  initialPage: Paginated<ArticleSummary>;
  limit?: number;
}

export default function ArticlesList({ query, initialPage, limit = 15 }: ArticlesListProps) {
  const { articles, fetchNextPage, hasNextPage, isFetchingNextPage } = useArticleListing(
    { ...query, limit },
    initialPage
  );

  if (!articles.length) {
    return <p className="py-16 text-center text-gray-700 dark:text-gray-500">No articles found.</p>;
  }

  return (
    <>
      <div data-aos="fade-up" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((item) => (
          <Article key={String(item._id)} {...item} />
        ))}
      </div>

      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        count={articles.length}
        limit={limit}
        noun="articles"
      />
    </>
  );
}
