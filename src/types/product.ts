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
> & { hoverImg: string | null };

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

export type ProductStatus = "draft" | "active" | "inactive";
export type ProductStatusFilter = "all" | ProductStatus;

export interface AdminProduct {
  _id: Id;
  title: string;
  slug?: string | null;
  description: string;
  images: string[];
  minPrice?: number;
  status: ProductStatus | "deleted" | string;
  tags?: string[];
  specs?: Record<string, string>;
  categoryPath?: Array<{ _id: Id; title?: string; name?: string } | Id>;
  variants: Array<{
    _id?: Id;
    sku: string;
    attributes: VariantAttributes;
    price: number;
    discount?: number;
    finalPrice?: number;
    stock?: number;
  }>;
  metrics?: { views?: number; sold?: number; score?: number; reviewsCount?: number };
  createdAt?: string;
}

export interface ProductPayload {
  title: string;
  description: string;
  categoryPath: Id[];
  images?: string[];
  tags: string[];
  specs: Record<string, string>;
  status?: ProductStatus;
  variants: Array<{
    _id?: Id;
    attributes: VariantAttributes;
    sku: string;
    price: number;
    discount: number;
    finalPrice: number;
    stock: number;
  }>;
}
