import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import type {
  ProductCardData,
  ProductCategoryRef,
  ProductDoc,
  ProductVariant,
  ProductView,
  VariantAttributes,
} from "@/types";

type VariantDoc = NonNullable<ProductDoc["variants"]>[number];

const toId = (value: unknown): string | null => {
  if (!value) return null;
  const withId = value as { _id?: unknown };
  return withId._id ? String(withId._id) : String(value);
};

const toPlainRecord = (value: VariantAttributes | Map<string, string> | undefined | null): Record<string, string> => {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value);
  return { ...value };
};

const serializeVariant = (variant: VariantDoc): ProductVariant => ({
  _id: toId(variant),
  sku: variant.sku ?? null,
  attributes: toPlainRecord(variant.attributes),
  price: Number(variant.price ?? 0),
  discount: Number(variant.discount ?? 0),
  finalPrice: Number(variant.finalPrice ?? variant.price ?? 0),
  stock: Number(variant.stock ?? 0),
});

const isCategoryRef = (value: unknown): value is { _id: unknown; title: string; slug: string } =>
  Boolean(value && typeof value === "object" && "title" in value);

export const toProductView = (product: ProductDoc | null | undefined): ProductView | null => {
  if (!product) return null;

  const variants = (product.variants ?? []).map(serializeVariant);
  const images = (product.images ?? []).filter(Boolean);
  const description = product.description ?? "";

  const defaultVariant = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;

  const price = product.minPrice || defaultVariant?.finalPrice || defaultVariant?.price || product.price || 0;

  const originalPrice = variants.find((v) => v.finalPrice === price && v.price > v.finalPrice)?.price ?? null;

  const categories: ProductCategoryRef[] = (product.categoryPath ?? [])
    .filter(isCategoryRef)
    .map((c) => ({ _id: toId(c), title: c.title, slug: c.slug }));

  return {
    _id: String(product._id),
    name: product.title,
    slug: product.slug ?? null,
    img: images[0] ?? PLACEHOLDER_IMAGE,
    images,
    price,
    originalPrice,
    score: Math.round(product.metrics?.score ?? 0),
    reviewsCount: product.metrics?.reviewsCount ?? 0,
    shortDescription: description.slice(0, 160),
    longDescription: description,
    tags: product.tags ?? [],
    specs: toPlainRecord(product.specs),
    categories,
    variants,
    variantsCount: variants.length,
    defaultVariantId: defaultVariant?._id ?? null,
    inStock: variants.length ? variants.some((v) => v.stock > 0) : true,
  };
};

export const toProductCard = (product: ProductDoc | null | undefined): ProductCardData | null => {
  const view = toProductView(product);
  if (!view) return null;

  const { _id, name, img, images, price, originalPrice, score, variantsCount, defaultVariantId, inStock } = view;

  return {
    _id,
    name,
    img,
    hoverImg: images[1] ?? null,
    price,
    originalPrice,
    score,
    variantsCount,
    defaultVariantId,
    inStock,
  };
};

export const toProductCards = (products: ProductDoc[] = []): ProductCardData[] =>
  products.map(toProductCard).filter((card): card is ProductCardData => card !== null);
