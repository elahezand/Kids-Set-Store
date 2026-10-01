"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiSearch, HiX } from "react-icons/hi";
import { CURRENCY } from "@/utils/format";

/*
  Every control writes a query param that buildProductFilters (utils/helper) understands:
  q, category (slug), max, sort, color, material.
*/
const MAX_PRICE = 400;
const MATERIALS = ["Cotton", "Leather", "Wool", "Velvet", "Suede", "Linen", "Cashmere", "Polyester"];
const COLORS = ["Blue", "Red", "Brown", "Gray", "Black", "Pink", "Metallic", "White", "Green", "Cream", "Camel"];
const SORTS = [
    { value: "latest", label: "Latest" },
    { value: "popularity", label: "Top rated" },
    { value: "bestSelling", label: "Best selling" },
    { value: "price", label: "Price: low to high" },
    { value: "price-desc", label: "Price: high to low" },
];

// flat list for the <select>: "Kids", "— Boys", "—— T-shirts"
const flatten = (nodes = [], depth = 0) =>
    nodes.flatMap((node) => [
        { slug: node.slug, label: `${"— ".repeat(depth)}${node.title ?? node.name}` },
        ...flatten(node.children, depth + 1),
    ]);

const controlClass =
    "w-full rounded-xl border-2 border-coral-300 bg-white px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-sage-400 dark:bg-ink-800 dark:text-gray-100 sm:text-base";

export default function FilterSection({ categories = [] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const get = (key) => searchParams.get(key) ?? "";

    const [search, setSearch] = useState(get("q"));
    const [maxPrice, setMaxPrice] = useState(get("max") || String(MAX_PRICE));

    // keep inputs in sync with back / forward navigation
    useEffect(() => {
        setSearch(searchParams.get("q") ?? "");
        setMaxPrice(searchParams.get("max") || String(MAX_PRICE));
    }, [searchParams]);

    const update = (changes) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("cursor"); // a new filter starts from the first page
        params.delete("value"); // old ?value= links are replaced by ?sort=

        for (const [key, value] of Object.entries(changes)) {
            if (value) params.set(key, value);
            else params.delete(key);
        }

        const qs = params.toString();
        startTransition(() => {
            router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        });
    };

    const options = flatten(categories);
    const hasFilters = ["q", "category", "max", "sort", "color", "material", "value"].some(
        (key) => searchParams.get(key)
    );

    return (
        <div
            className={`mb-8 rounded-2xl bg-mint-200 p-4 shadow-card transition-opacity dark:bg-ink-800/60 ${isPending ? "opacity-70" : ""}`}
            aria-busy={isPending}
        >
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    update({ q: search.trim() });
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
                <select
                    aria-label="Category"
                    value={get("category")}
                    onChange={(e) => update({ category: e.target.value })}
                    className={controlClass}
                >
                    <option value="">All categories</option>
                    {options.map((option) => (
                        <option key={option.slug} value={option.slug}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Sort"
                    value={get("sort") || (get("value") === "bestSelling" ? "bestSelling" : "")}
                    onChange={(e) => update({ sort: e.target.value })}
                    className={controlClass}
                >
                    <option value="">Sort: newest</option>
                    {SORTS.map((sort) => (
                        <option key={sort.value} value={sort.value}>
                            {sort.label}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Color"
                    value={get("color")}
                    onChange={(e) => update({ color: e.target.value })}
                    className={controlClass}
                >
                    <option value="">Any color</option>
                    {COLORS.map((color) => (
                        <option key={color} value={color}>
                            {color}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Material"
                    value={get("material")}
                    onChange={(e) => update({ material: e.target.value })}
                    className={controlClass}
                >
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
                        onPointerUp={() => update({ max: maxPrice === String(MAX_PRICE) ? "" : maxPrice })}
                        onKeyUp={() => update({ max: maxPrice === String(MAX_PRICE) ? "" : maxPrice })}
                        className="w-full accent-coral-300"
                    />
                </label>
            </div>

            {hasFilters && (
                <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        startTransition(() => router.push(pathname, { scroll: false }));
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
