"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { LuCheck, LuShoppingCart, LuSlidersHorizontal } from "react-icons/lu";
import AddToFavorite from "@/components/modules/main/addToFavorite";
import { useAddToCart } from "@/services/client/cart";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type { ProductCardData } from "@/types";

const PHOTO_TINTS = [
  "bg-coral-50 dark:bg-coral-500/10",
  "bg-sky-50 dark:bg-sky-500/10",
  "bg-sun-50 dark:bg-sun-500/10",
  "bg-sage-50 dark:bg-sage-500/10",
] as const;

const tintFor = (id: string) => PHOTO_TINTS[id.charCodeAt(id.length - 1) % PHOTO_TINTS.length];

const IMAGE_SIZES = "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw";

const buttonBase =
  "flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ink-900/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed dark:focus-visible:ring-white/50 dark:focus-visible:ring-offset-ink-900";

export default function ProductCard({
  _id,
  name,
  img,
  hoverImg = null,
  price,
  originalPrice,
  score = 0,
  variantsCount = 0,
  defaultVariantId = null,
  inStock = true,
}: ProductCardData) {
  const href = ROUTES.product(_id);
  const needsChoice = variantsCount > 1;
  const { mutate: addToCart, isPending } = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const hasDiscount = originalPrice !== null && originalPrice > price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAdd = () => {
    if (isPending || !inStock) return;
    addToCart(
      { items: [{ productId: _id, variantId: defaultVariantId, quantity: 1 }] },
      { onSuccess: () => setJustAdded(true) }
    );
  };

  const buttonColor = !inStock
    ? "bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400"
    : justAdded
      ? "bg-mint-500 text-white"
      : "bg-sage-600 text-white hover:bg-sage-700";

  return (
    <article className="group relative flex h-full flex-col rounded-3xl bg-white p-2.5 ring-1 ring-gray-200/70 transition-shadow duration-300 hover:shadow-float sm:p-3 dark:bg-ink-800 dark:ring-white/5">
      <Link
        href={href}
        aria-label={name}
        className={`relative block aspect-square overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:outline-none ${tintFor(_id)}`}
      >
        <Image
          fill
          src={img || PLACEHOLDER_IMAGE}
          alt={name}
          sizes={IMAGE_SIZES}
          className={`object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
            inStock ? "" : "opacity-50 grayscale"
          }`}
        />
        {hoverImg && inStock && (
          <Image
            fill
            src={hoverImg}
            alt=""
            sizes={IMAGE_SIZES}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {discount > 0 && (
          <span className="absolute top-2 left-2 rounded-full bg-coral-600 px-2.5 py-1 text-xs font-bold text-white shadow-card tabular-nums">
            {discount}% off
          </span>
        )}
      </Link>

      <div className="absolute top-4 right-4 z-10 sm:top-4.5 sm:right-4.5">
        <AddToFavorite productId={_id} compact />
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link
          href={href}
          className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-gray-900 hover:underline dark:text-gray-100"
        >
          {name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex min-w-0 flex-col">
            {hasDiscount && <span className="price-old text-xs">{formatPrice(originalPrice)}</span>}
            <span className="price text-base sm:text-lg">{formatPrice(price)}</span>
          </div>

          {score > 0 && (
            <span className="mb-1 flex shrink-0 items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <FaStar className="size-3.5 text-sun-500" aria-hidden="true" />
              <span>
                <span className="sr-only">Rated </span>
                {score}
                <span className="sr-only"> out of 5</span>
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        {needsChoice ? (
          <Link
            href={href}
            className={`${buttonBase} ${inStock ? "bg-sage-600 text-white hover:bg-sage-700" : buttonColor}`}
            aria-label={`Choose options for ${name}`}
          >
            <LuSlidersHorizontal className="size-4" />
            options
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending || !inStock}
            className={`${buttonBase} ${buttonColor}`}
            aria-label={inStock ? `Add ${name} to cart` : `${name} is sold out`}
          >
            {justAdded ? (
              <LuCheck className="size-4" />
            ) : isPending ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
            ) : inStock ? (
              <LuShoppingCart className="size-4" />
            ) : null}
            <span aria-live="polite">
              {!inStock ? "Sold out" : justAdded ? "Added" : isPending ? "Adding..." : "Add to cart"}
            </span>
          </button>
        )}
      </div>
    </article>
  );
}
