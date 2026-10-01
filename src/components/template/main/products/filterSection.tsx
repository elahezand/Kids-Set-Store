"use client";

import { useEffect, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { useQueryParams } from "@/services/client/listing";
import { CURRENCY } from "@/utils/format";
import type { CategoryNode, CategoryOption, ListingFilterKey, ListingSort, SelectOption } from "@/types";

/* Every control writes a query param buildProductFilters (utils/helper) understands */
const MAX_PRICE = 400;
const MATERIALS = ["Cotton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Cashmere", "Polyester"];
const COLORS = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metallic", "White", "Green", "Cream", "Camel"];
const SORTS: SelectOption<ListingSort>[] = [
  { value: "latest", label: "Latest" },
  { value: "popularity", label: "Top rated" },
  { value: "bestSelling", label: "Best selling" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];
const FILTER_KEYS: ListingFilterKey[] = ["q", "category", "max", "sort", "color", "material", "value"];

// flat list for the <select>: "Kids", "— Boys", "— — T-shirts"
const flatten = (nodes: CategoryNode[] = [], depth = 0): CategoryOption[] =>
  nodes.flatMap((node) => [
    { slug: node.slug, label: `${"— ".repeat(depth)}${node.title}` },
    ...flatten(node.children, depth + 1),
  ]);

const controlClass =
  "w-full rounded-xl border-2 border-coral-300 bg-white px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-sage-400 dark:bg-ink-800 dark:text-gray-100 sm:text-base";

export default function FilterSection({ categories = [] }: { categories?: CategoryNode[] }) {
  const { get, update, clear, has, isPending, searchParams } = useQueryParams<ListingFilterKey>();

  const [search, setSearch] = useState(get("q"));
  const [maxPrice, setMaxPrice] = useState(get("max") || String(MAX_PRICE));

  // keep inputs in sync with back / forward navigation
  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setMaxPrice(searchParams.get("max") || String(MAX_PRICE));
  }, [searchParams]);

  // ?value= is the old name of ?sort=
  const set = (changes: Partial<Record<ListingFilterKey, string>>) => update(changes, ["value"]);
  const commitPrice = () => set({ max: maxPrice === String(MAX_PRICE) ? "" : maxPrice });

  return (
    <div
      className={`mb-8 rounded-2xl bg-mint-200 p-4 shadow-card transition-opacity dark:bg-ink-800/60 ${isPending ? "opacity-70" : ""}`}
      aria-busy={isPending}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: search.trim() });
        }}
        className="mb-3 flex gap-2"
      >
        <div className="relative flex-1">
          <HiSearch className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            maxLength={100}
            className={`${controlClass} pl-10`}
          />
        </div>
        <button type="submit" className="btn btn-secondary px-6" disabled={isPending}>
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select aria-label="Category" value={get("category")} onChange={(e) => set({ category: e.target.value })} className={controlClass}>
          <option value="">All categories</option>
          {flatten(categories).map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort"
          value={get("sort") || (get("value") === "bestSelling" ? "bestSelling" : "")}
          onChange={(e) => set({ sort: e.target.value })}
          className={controlClass}
        >
          <option value="">Sort: newest</option>
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>

        <select aria-label="Color" value={get("color")} onChange={(e) => set({ color: e.target.value })} className={controlClass}>
          <option value="">Any color</option>
          {COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>

        <select aria-label="Material" value={get("material")} onChange={(e) => set({ material: e.target.value })} className={controlClass}>
          <option value="">Any material</option>
          {MATERIALS.map((material) => (
            <option key={material} value={material}>
              {material}
            </option>
          ))}
        </select>

        <label className={`${controlClass} flex flex-col gap-1`}>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Max price: {maxPrice} {CURRENCY}
          </span>
          <input
            type="range"
            min="0"
            max={MAX_PRICE}
            step="5"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            // only hit the server when the user lets go of the slider
            onPointerUp={commitPrice}
            onKeyUp={commitPrice}
            className="w-full accent-coral-300"
          />
        </label>
      </div>

      {has(FILTER_KEYS) && (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            clear();
          }}
          className="mt-3 inline-flex items-center gap-1 text-sm text-gray-700 hover:text-coral-400 dark:text-gray-300"
        >
          <HiX className="size-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
