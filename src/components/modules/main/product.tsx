"use client";

import Link from "next/link";
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import AddToFavoriteList from "@/components/modules/main/addToFavorite";
import Stars from "@/components/modules/ui/stars";
import { useAddToCart } from "@/services/client/cart";
import { formatPrice } from "@/utils/format";
import { PLACEHOLDER_IMAGE } from "@/utils/productView";
import type { ProductCard } from "@/types";

/*
  Product card (shape: toProductCard() in utils/productView).
  A product with several variants needs a choice -> the button opens the product page.
*/
export default function Product({
  _id,
  name,
  img,
  price,
  originalPrice,
  score = 0,
  variantsCount = 0,
  defaultVariantId = null,
  inStock = true,
}: ProductCard) {
  const href = `/products/${_id}`;
  const needsChoice = variantsCount > 1;
  const { mutate: addToCart, isPending } = useAddToCart();

  const handleAdd = () => {
    if (isPending || !inStock) return;
    addToCart({ items: [{ productId: _id, variantId: defaultVariantId, quantity: 1 }] });
  };

  const actionClass =
    "invisible absolute bottom-0 left-1/2 z-[3] w-max -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-md border border-white bg-transparent px-3 py-1 text-sm text-white opacity-0 transition-all duration-300 group-hover:visible group-hover:bottom-1/2 group-hover:opacity-100 hover:bg-coral-300 disabled:cursor-not-allowed";

  return (
    <div className="group relative flex h-full w-full flex-col rounded-2xl bg-white p-2 text-text shadow-card dark:bg-ink-800 dark:text-gray-100">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
        <Image
          fill
          src={img || PLACEHOLDER_IMAGE}
          alt={name}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {!inStock && (
          <span className="absolute left-2 top-2 z-[4] rounded-full bg-gray-900/80 px-2.5 py-1 text-xs text-white">
            Out of stock
          </span>
        )}

        <div className="pointer-events-none absolute inset-0 z-[2] rounded-xl bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="invisible absolute right-2 top-2 z-[3] flex flex-col items-end gap-2 text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
          <Link
            href={href}
            aria-label={`View ${name}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl text-coral-300"
          >
            <CiSearch />
          </Link>
          <AddToFavoriteList productId={_id} compact />
        </div>

        {needsChoice ? (
          <Link href={href} className={actionClass}>
            Choose options
          </Link>
        ) : (
          <button type="button" onClick={handleAdd} disabled={isPending || !inStock} className={actionClass}>
            {!inStock ? "Out of stock" : isPending ? "Adding..." : "Add to cart"}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-center">
        <Link href={href} className="line-clamp-1 text-[13px] sm:text-sm">
          {name}
        </Link>

        {score > 0 && <Stars score={score} className="text-sage-400" />}

        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-text dark:text-gray-100 sm:text-sm md:text-base">
            {formatPrice(price)}
          </span>
          {originalPrice !== null && originalPrice > price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
