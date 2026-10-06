"use client";

import LoadMore from "@/components/modules/main/loadMore";
import type { ReactNode } from "react";

interface ListCardProps {
  title: string;
  toolbar?: ReactNode;
  isEmpty: boolean;
  empty: ReactNode;
  children: ReactNode;
  pager: {
    hasNextPage?: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => unknown;
    count: number;
    limit: number;
    noun: string;
  };
}

export default function ListCard({ title, toolbar, isEmpty, empty, children, pager }: ListCardProps) {
  return (
    <div className="w-full min-w-0">
      <section className="card w-full min-w-0 overflow-hidden">
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          {toolbar && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{toolbar}</div>}
        </div>

        {isEmpty ? empty : children}
      </section>

      {!isEmpty && (
        <div className="mt-6">
          <LoadMore
            hasMore={Boolean(pager.hasNextPage)}
            isLoading={pager.isFetchingNextPage}
            onLoadMore={() => pager.fetchNextPage()}
            count={pager.count}
            limit={pager.limit}
            noun={pager.noun}
          />
        </div>
      )}
    </div>
  );
}