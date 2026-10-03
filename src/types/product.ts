import type { Id } from "./api";

export type VariantAttributes = Record<string, string>;

export interface ProductVariant {
  _id: Id | null;
  sku: string | null;
  attributes: VariantAttributes;
  price: number;
  discount: number;
  finalPrice: number;
  stock: number;
}

export interface ProductCategoryRef {
  _id: Id | null;
  title: string;
  slug: string;
}

export interface ProductView {
  _id: Id;
  name: string;
  slug: string | null;
  img: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  score: number;
  reviewsCount: number;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  specs: Record<string, string>;
  categories: ProductCategoryRef[];
  variants: ProductVariant[];
  variantsCount: number;
  defaultVariantId: Id | null;
  inStock: boolean;
}

export type ProductCardData = Pick<
  ProductView,
  "_id" | "name" | "img" | "price" | "originalPrice" | "score" | "variantsCount" | "defaultVariantId" | "inStock"
>;

export interface ProductDoc {
  _id: unknown;
  title: string;
  slug?: string | null;
  description?: string;
  images?: string[];
  price?: number;
  minPrice?: number;
  variants?: Array<{
    _id?: unknown;
    sku?: string;
    attributes?: VariantAttributes | Map<string, string>;
    price?: number;
    discount?: number;
    finalPrice?: number;
    stock?: number;
  }>;
  metrics?: { views?: number; sold?: number; score?: number; reviewsCount?: number };
  tags?: string[];
  specs?: Record<string, string> | Map<string, string>;
  categoryPath?: Array<unknown>;
  status?: string;
}
