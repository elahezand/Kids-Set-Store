"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiSearch, HiX } from "react-icons/hi";

export default function ArticlesSearch({ categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQ = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  const [value, setValue] = useState(urlQ);

  // keep the input in sync with the URL (back/forward, clear, shared links)
  useEffect(() => {
    setValue(urlQ);
  }, [urlQ]);

  const update = (changes) => {
    const params = new URLSearchParams(searchParams.toString());

    // a new filter must start from the first page
    params.delete("cursor");

    for (const [key, val] of Object.entries(changes)) {
      if (val) params.set(key, val);
      else params.delete(key);
    }

    const qs = params.toString();

    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    update({ q: value.trim() });
  };

  const hasFilter = Boolean(urlQ || urlCategory);

  return (
    <form
      onSubmit={onSubmit}
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
          value={urlCategory}
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

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-secondary sm:px-8"
      >
        {isPending ? "Searching..." : "Search"}
      </button>

      {hasFilter && (
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