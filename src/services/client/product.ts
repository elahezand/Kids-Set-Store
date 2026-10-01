"use client";

import { useMemo, useState } from "react";
import type { ProductVariant, ProductView } from "@/types";

/* Variant choice on the product page (size / color / ...) */

export type AttributeOptions = Array<[attribute: string, values: string[]]>;

/** [["color", ["red", "blue"]], ["size", ["2Y", "4Y"]]] from every variant */
export const getAttributeOptions = (variants: ProductVariant[] = []): AttributeOptions => {
  const options = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const [key, value] of Object.entries(variant.attributes ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      if (!options.has(key)) options.set(key, new Set());
      options.get(key)!.add(String(value));
    }
  }

  return [...options.entries()].map(([name, values]) => [name, [...values]]);
};

/** the variant with the new value that keeps most of the current choices */
export const pickVariant = (
  variants: ProductVariant[],
  current: ProductVariant | null,
  attribute: string,
  value: string
): ProductVariant | null => {
  const candidates = variants.filter((v) => String(v.attributes?.[attribute]) === value);
  if (!candidates.length) return null;

  const currentAttrs = current?.attributes ?? {};
  const similarity = (v: ProductVariant) =>
    Object.entries(currentAttrs).filter(
      ([key, val]) => key !== attribute && String(v.attributes?.[key]) === String(val)
    ).length;

  return candidates.reduce((best, v) => (similarity(v) > similarity(best) ? v : best));
};

/** is there any variant in stock with attribute = value */
export const isValueAvailable = (variants: ProductVariant[], attribute: string, value: string) =>
  variants.some((v) => String(v.attributes?.[attribute]) === value && (v.stock ?? 0) > 0);

export const useVariantSelection = (product: ProductView) => {
  const variants = product.variants;

  const [selected, setSelected] = useState<ProductVariant | null>(
    () => variants.find((v) => v._id === product.defaultVariantId) ?? null
  );

  const options = useMemo(() => getAttributeOptions(variants), [variants]);

  const select = (attribute: string, value: string) => {
    const next = pickVariant(variants, selected, attribute, value);
    if (next) setSelected(next);
  };

  // a product without variants is sellable (the server has no stock limit for it)
  const inStock = selected ? (selected.stock ?? 0) > 0 : variants.length === 0;
  const price = selected?.finalPrice ?? selected?.price ?? product.price;
  const originalPrice = selected && selected.price > price ? selected.price : null;

  return {
    selected,
    selectedAttributes: selected?.attributes ?? {},
    options,
    select,
    inStock,
    price,
    originalPrice,
  };
};

export type VariantSelection = ReturnType<typeof useVariantSelection>;
