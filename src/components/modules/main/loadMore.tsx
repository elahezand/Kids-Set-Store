"use client";

import { HiChevronDown } from "react-icons/hi";

interface LoadMoreProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  count: number;
  limit: number;
  noun?: string;
}

export default function LoadMore({ hasMore, isLoading, onLoadMore, count, limit, noun = "items" }: LoadMoreProps) {
  if (hasMore) {
    return (
      <div className="mt-10 flex w-full justify-center">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoading}
          className="btn btn-lg btn-secondary w-full rounded-full sm:w-auto sm:px-10"
        >
          <span>{isLoading ? "Loading..." : "Load more"}</span>
          <HiChevronDown className={`size-5 ${isLoading ? "animate-bounce" : ""}`} />
        </button>
      </div>
    );
  }

  if (count > limit) {
    return (
      <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-500">
        You have seen all {count} {noun}.
      </p>
    );
  }

  return null;
}
