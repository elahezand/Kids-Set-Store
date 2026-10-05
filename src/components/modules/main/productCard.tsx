"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { LuPlus, LuSlidersHorizontal } from "react-icons/lu";
import AddToFavorite from "@/components/modules/main/addToFavorite";
import { useAddToCart } from "@/services/client/cart";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type { ProductCardData } from "@/types";

const MEDIA_TINTS = [
  "bg-coral-50 dark:bg-white/5",
  "bg-sky-50 dark:bg-white/5",
  "bg-sun-50 dark:bg-white/5",
  "bg-sage-50 dark:bg-white/5",
];

const tintFor = (id: string) => MEDIA_TINTS[id.charCodeAt(id.length - 1) % MEDIA_TINTS.length];

const roundButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-600 text-white shadow-card transition hover:bg-sage-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-white/10";

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

  const hasDiscount = originalPrice !== null && originalPrice > price;
  const discount = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAdd = () => {
    if (isPending || !inStock) return;
    addToCart({ items: [{ productId: _id, variantId: defaultVariantId, quantity: 1 }] });
  };

  return (
    <article className="product-card group h-full">
      <Link href={href} className={`product-card-media block ${tintFor(_id)}`} aria-label={name}>
        <Image
          fill
          src={img || PLACEHOLDER_IMAGE}
          alt={name}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />
        {hoverImg && (
          <Image
            fill
            src={hoverImg}
            alt=""
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {discount > 0 && <span className="discount-tag">-{discount}%</span>}

        {!inStock && (
          <span className="absolute inset-x-3 bottom-3 z-10 rounded-full bg-white/90 py-1 text-center text-xs font-semibold text-gray-700 backdrop-blur dark:bg-ink-900/80 dark:text-gray-300">
            Out of stock
          </span>
        )}
      </Link>

      <div className="absolute top-2.5 right-2.5 z-10">
        <AddToFavorite productId={_id} compact />
      </div>

      <div className="product-card-body">
        <div className="flex items-center justify-between gap-2">
          <Link href={href} className="product-card-title min-w-0 hover:text-sage-700 dark:hover:text-sage-300">
            {name}
          </Link>

          {score > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
              <FaStar className="text-sun-400" aria-hidden="true" />
              <span>
                <span className="sr-only">Rated </span>
                {score}
                <span className="sr-only"> out of 5</span>
              </span>
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="price">{formatPrice(price)}</span>
            {hasDiscount && <span className="price-old">{formatPrice(originalPrice)}</span>}
          </div>

          {needsChoice ? (
            <Link href={href} className={roundButton} aria-label={`Choose options for ${name}`} title="Choose options">
              <LuSlidersHorizontal className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !inStock}
              className={roundButton}
              aria-label={inStock ? `Add ${name} to cart` : `${name} is out of stock`}
              title={inStock ? "Add to cart" : "Out of stock"}
            >
              <LuPlus className={`size-5 ${isPending ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
