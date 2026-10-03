"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toProductCards } from "@/utils/productView";
import type { ArticleListQuery, ArticleSummary, FavoriteEntry, ListingQuery, Paginated, ProductDoc } from "@/types";
import { queryKeys } from "./keys";
import { useInfiniteGet } from "./query";


/** read / change the filter params in the URL */
export const useQueryParams = <TKey extends string = string>() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = (key: TKey): string => searchParams.get(key) ?? "";

  const update = (changes: Partial<Record<TKey, string | null | undefined>>, drop: string[] = []) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("cursor")

    for (const key of drop) params.delete(key);

    for (const [key, value] of Object.entries(changes) as [string, string | null | undefined][]) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const clear = () => startTransition(() => router.push(pathname, { scroll: false }));

  const has = (keys: TKey[]) => keys.some((key) => Boolean(searchParams.get(key)));

  return { get, update, clear, has, isPending, searchParams };
};

/* ---------- infinite lists (Load more) ----------*/

const flattenPages = <TItem>(pages?: Array<Paginated<TItem>>) =>
  pages?.flatMap((page) => page.data ?? []) ?? [];

const filtersOnly = <TQuery extends object>(query: TQuery): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(query).filter(([key, value]) => key !== "cursor" && value !== undefined && value !== "")
  );

/** GET /api/products (services/server/public/product getAllProducts) */
export const useProductListing = (query: ListingQuery, initialPage: Paginated<ProductDoc>) => {
  const filters = filtersOnly(query);
  const result = useInfiniteGet<ProductDoc>("/products", filters, {
    queryKey: queryKeys.products(filters),
    initialPage,
    errorFallback: "Could not load products",
  });

  const products = useMemo(() => toProductCards(flattenPages(result.data?.pages)), [result.data]);
  return { ...result, products };
};

/** GET /api/articles (services/server/public/article getPublicArticles) */
export const useArticleListing = (query: ArticleListQuery, initialPage: Paginated<ArticleSummary>) => {
  const filters = filtersOnly(query);
  const result = useInfiniteGet<ArticleSummary>("/articles", filters, {
    queryKey: queryKeys.articles(filters),
    initialPage,
    errorFallback: "Could not load articles",
  });

  const articles = useMemo(() => flattenPages(result.data?.pages), [result.data]);
  return { ...result, articles };
};

/** GET /api/user/favorites (services/server/user/favorite getUserFavorites) */
export const useFavoriteListing = (initialPage: Paginated<FavoriteEntry>, limit = 20) => {
  const result = useInfiniteGet<FavoriteEntry>("/user/favorites", { limit }, {
    queryKey: queryKeys.favorites,
    initialPage,
    errorFallback: "Could not load favorites",
  });

  const products = useMemo(
    () =>
      toProductCards(
        flattenPages(result.data?.pages)
          .map((favorite) => favorite.productId)
          .filter((product): product is ProductDoc => Boolean(product && product.status === "active"))
      ),
    [result.data]
  );

  return { ...result, products };
};
