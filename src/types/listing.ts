import type { Pagination } from "./api";
import type { ProductCardData } from "./product";

export type ListingSort = "latest" | "price" | "price-desc" | "popularity" | "bestSelling";

export interface ListingQuery {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  price?: string;
  color?: string;
  size?: string;
  material?: string;
  filter?: string;
  inStock?: string;
  onSale?: string;
  rating?: string;
  tags?: string;
  sort?: ListingSort;
  limit?: string;
  cursor?: string;
}

export type ListingFilterKey = Exclude<keyof ListingQuery, "limit" | "cursor">;

export interface ListingPage {
  products: ProductCardData[];
  pagination: Pagination;
}

export interface SelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
}
