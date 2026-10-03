"use client";

import { useEffect, useMemo, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { useQueryParams } from "@/services/client/listing";
import { CURRENCY } from "@/utils/format";
import type { CategoryFilter, CategoryNode, CategoryOption, ListingFilterKey, ListingSort, SelectOption } from "@/types";
const MAX_PRICE = 400;
const VARIANT_SLUGS = ["size", "color"];

const SORTS: SelectOption<ListingSort>[] = [
  { value: "latest", label: "Latest" },
  { value: "popularity", label: "Top rated" },
  { value: "bestSelling", label: "Best selling" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];
const isVariantFilter = (filter: CategoryFilter) => VARIANT_SLUGS.includes(filter.slug);

const flatten = (nodes: CategoryNode[] = [], depth = 0): CategoryOption[] =>
  nodes.flatMap((node) => [
    { slug: node.slug, label: `${"— ".repeat(depth)}${node.title}` },
    ...flatten(node.children, depth + 1),
  ]);

const parseSpecs = (raw: string | null): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const controlClass =
  "w-full rounded-xl border-2 border-coral-300 bg-white px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-sage-400 dark:bg-ink-800 dark:text-gray-100 sm:text-base";

interface FilterSectionProps {
  categories?: CategoryNode[];
  categoryFilters?: CategoryFilter[];
}

export default function FilterSection({ categories = [], categoryFilters = [] }: FilterSectionProps) {
  const { get, update, clear, isPending, searchParams } = useQueryParams<ListingFilterKey>();

  const [search, setSearch] = useState(get("q"));
  const [maxPrice, setMaxPrice] = useState(get("max") || String(MAX_PRICE));

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setMaxPrice(searchParams.get("max") || String(MAX_PRICE));
  }, [searchParams]);

  const specs = useMemo(() => parseSpecs(searchParams.get("filter")), [searchParams]);

  const set = (changes: Partial<Record<ListingFilterKey, string>>, drop: string[] = []) =>
    update(changes, drop);

  const commitPrice = () => set({ max: maxPrice === String(MAX_PRICE) ? "" : maxPrice });

  const changeCategory = (slug: string) =>
    set({ category: slug, size: "", color: "", material: "", filter: "" });

  const valueOf = (filter: CategoryFilter) =>
    isVariantFilter(filter) ? get(filter.slug as ListingFilterKey) : specs[filter.slug] ?? "";

  const setFilterValue = (filter: CategoryFilter, value: string) => {
    if (isVariantFilter(filter)) {
      set({ [filter.slug]: value } as Partial<Record<ListingFilterKey, string>>);
      return;
    }

    const next = { ...specs };
    if (value) next[filter.slug] = value;
    else delete next[filter.slug];

    set({ filter: Object.keys(next).length ? JSON.stringify(next) : "" }, ["material"]);
  };

  const choiceFilters = categoryFilters.filter((f) => f.type === "select" || f.type === "radio");
  const booleanFilters = categoryFilters.filter((f) => f.type === "boolean");

  return (
    <div
      className={`mb-8 rounded-2xl border border-sage-100 bg-sage-50 p-4 shadow-card transition-opacity dark:border-white/10 dark:bg-ink-800/60 ${isPending ? "opacity-70" : ""}`} aria-busy={isPending}
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

      {/* always available */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select aria-label="Category" value={get("category")} onChange={(e) => changeCategory(e.target.value)} className={controlClass}>
          <option value="">All categories</option>
          {flatten(categories).map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort"
          value={get("sort")}
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
            onPointerUp={commitPrice}
            onKeyUp={commitPrice}
            className="w-full accent-coral-300"
          />
        </label>

        {/* two small toggles share one grid cell */}
        <div className="grid grid-cols-2 gap-3">
          <label className={`${controlClass} flex cursor-pointer items-center gap-2`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={get("inStock") === "true"}
              onChange={(e) => set({ inStock: e.target.checked ? "true" : "" })}
            />
            In stock
          </label>

          <label className={`${controlClass} flex cursor-pointer items-center gap-2`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={get("onSale") === "true"}
              onChange={(e) => set({ onSale: e.target.checked ? "true" : "" })}
            />
            On sale
          </label>
        </div>
      </div>

      {/* from the selected category */}
      {(choiceFilters.length > 0 || booleanFilters.length > 0) && (
        <div className="mt-3 border-t border-sage-100 pt-3 dark:border-white/10">
          {choiceFilters.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {choiceFilters.map((filter) => (
                <select
                  key={filter.slug}
                  aria-label={filter.name}
                  value={valueOf(filter)}
                  onChange={(e) => setFilterValue(filter, e.target.value)}
                  className={controlClass}
                >
                  <option value="">{`Any ${filter.name.toLowerCase()}`}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}

          {booleanFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {booleanFilters.map((filter) => {
                const active = valueOf(filter) === "true";
                return (
                  <button
                    key={filter.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilterValue(filter, active ? "" : "true")}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-medium transition-colors ${active
                      ? "border-sage-600 bg-sage-600 text-white"
                      : "border-coral-300 bg-white text-text hover:border-sage-400 dark:bg-ink-800 dark:text-gray-100"
                      }`}
                  >
                    {filter.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {searchParams.toString() !== "" && (
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
