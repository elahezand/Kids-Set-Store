import type { Pagination } from "./api";
import type { ProductCard } from "./product";

/* Shop listing (/products, GET /api/products) — query keys buildProductFilters understands */

export type ListingSort = "latest" | "price" | "price-desc" | "popularity" | "bestSelling";

export interface ListingQuery {
  q?: string;
  category?: string; // category slug
  min?: string;
  max?: string;
  price?: string; // "min-max"
  color?: string;
  size?: string;
  material?: string;
  rating?: string;
  tags?: string; // comma separated
  sort?: ListingSort;
  /** old links: ?value=bestSelling */
  value?: string;
  limit?: string;
  cursor?: string;
}

export type ListingFilterKey = Exclude<keyof ListingQuery, "limit" | "cursor">;

export interface ListingPage {
  products: ProductCard[];
  pagination: Pagination;
}

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}
