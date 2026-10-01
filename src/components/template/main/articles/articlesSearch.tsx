"use client";

import { useEffect, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { useQueryParams } from "@/services/client/listing";
import type { ArticleCategoryOption } from "@/types";

type ArticleFilterKey = "q" | "category";

export default function ArticlesSearch({ categories = [] }: { categories?: ArticleCategoryOption[] }) {
  const { get, update, has, isPending } = useQueryParams<ArticleFilterKey>();

  const urlQ = get("q");
  const [value, setValue] = useState(urlQ);

  // keep the input in sync with the URL (back/forward, clear, shared links)
  useEffect(() => setValue(urlQ), [urlQ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: value.trim() });
      }}
      role="search"
      className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <HiSearch className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search articles..."
          aria-label="Search articles"
          maxLength={100}
          className="input w-full pl-10"
        />
      </div>

      {categories.length > 0 && (
        <select
          value={get("category")}
          onChange={(e) => update({ category: e.target.value, q: value.trim() })}
          aria-label="Filter by category"
          className="input sm:w-56"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title || category.slug}
            </option>
          ))}
        </select>
      )}

      <button type="submit" disabled={isPending} className="btn btn-secondary sm:px-8">
        {isPending ? "Searching..." : "Search"}
      </button>

      {has(["q", "category"]) && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            update({ q: "", category: "" });
          }}
          className="inline-flex items-center justify-center gap-1 text-sm text-gray-600 hover:text-coral-300 dark:text-gray-400"
        >
          <HiX className="size-4" />
          Clear
        </button>
      )}
    </form>
  );
}
