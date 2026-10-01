"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FaFacebookF, FaLinkedinIn, FaPinterest, FaStar, FaTelegram, FaTwitter } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import type { IconType } from "react-icons";
import AddToBasket from "@/components/modules/main/addToBasket";
import AddToFavoriteList from "@/components/modules/main/addToFavorite";
import { isValueAvailable, type AttributeOptions, type VariantSelection } from "@/services/client/product";
import { formatPrice } from "@/utils/format";
import type { ProductVariant, ProductView } from "@/types";

const MAX_SCORE = 5;
const COLOR_KEYS = ["color", "colour"];

interface ShareLink {
  name: string;
  Icon: IconType;
  href: string;
}

const getShareLinks = (product: ProductView): ShareLink[] => {
  const url = encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product._id}`);
  const text = encodeURIComponent(product.name);
  const media = encodeURIComponent(product.img ?? "");

  return [
    { name: "Telegram", Icon: FaTelegram, href: `https://t.me/share/url?url=${url}&text=${text}` },
    { name: "LinkedIn", Icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { name: "Pinterest", Icon: FaPinterest, href: `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${text}` },
    { name: "Twitter", Icon: FaTwitter, href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
    { name: "Facebook", Icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
  ];
};

/* ---------- small components ---------- */

const Rating = ({ score, commentsCount }: { score: number; commentsCount: number }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-1" role="img" aria-label={`Rated ${score} out of ${MAX_SCORE}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: MAX_SCORE }, (_, i) =>
          i < score ? (
            <FaStar key={i} className="text-lg text-coral-300" />
          ) : (
            <FaRegStar key={i} className="text-lg text-coral-300" />
          )
        )}
      </div>
      <span className="text-sm font-semibold">
        {score}/{MAX_SCORE}
      </span>
    </div>

    <span className="h-4 w-px bg-gray-300 dark:bg-white/20" aria-hidden />

    <a href="#comments" className="text-sm text-gray-500 underline-offset-2 hover:text-sage-400 hover:underline dark:text-gray-400">
      {commentsCount} reviews
    </a>
  </div>
);

const Price = ({ price, originalPrice }: { price: number; originalPrice: number | null }) => {
  const percent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="flex flex-wrap items-baseline gap-3">
      <span className="font-shabnam-bold text-4xl leading-none text-sage-400">{formatPrice(price)}</span>
      {originalPrice !== null && (
        <>
          <span className="text-lg text-gray-400 line-through">{formatPrice(originalPrice)}</span>
          <span className="rounded-full bg-coral-300 px-2.5 py-0.5 text-sm font-semibold text-white">-{percent}%</span>
        </>
      )}
    </div>
  );
};

const StockBadge = ({ inStock }: { inStock: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-sm font-medium ${
      inStock ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    }`}
  >
    {inStock ? <IoCheckmarkCircle className="text-lg" /> : <IoCloseCircle className="text-lg" />}
    {inStock ? "In stock" : "Out of stock"}
  </span>
);

interface VariantSelectorProps {
  options: AttributeOptions;
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onSelect: (attribute: string, value: string) => void;
}

const VariantSelector = ({ options, variants, selectedAttributes, onSelect }: VariantSelectorProps) => {
  if (!options.length) return null;

  return (
    <div className="flex flex-col gap-5">
      {options.map(([attribute, values]) => {
        const isColor = COLOR_KEYS.includes(attribute.toLowerCase());

        return (
          <div key={attribute} className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold capitalize">
              {attribute}
              <span className="ml-1 font-normal text-gray-500 dark:text-gray-400">
                : {String(selectedAttributes[attribute] ?? "-")}
              </span>
            </span>

            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isActive = String(selectedAttributes[attribute]) === value;
                const available = isValueAvailable(variants, attribute, value);

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onSelect(attribute, value)}
                    className={`flex min-h-[44px] min-w-[52px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-sage-400 bg-sage-400/10 text-sage-400 ring-1 ring-sage-400"
                        : "border-gray-300 hover:border-sage-400 dark:border-white/20"
                    } ${available ? "" : "opacity-50 line-through"}`}
                  >
                    {isColor && (
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: value }}
                        aria-hidden
                      />
                    )}
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- main ---------- */

interface DetailsProps {
  product: ProductView;
  commentsCount: number;
  selection: VariantSelection;
  isFavorited?: boolean;
}

const Details = ({ product, commentsCount, selection, isFavorited }: DetailsProps) => {
  const shareLinks = useMemo(() => getShareLinks(product), [product]);
  const { selected, selectedAttributes, options, select, inStock, price, originalPrice } = selection;

  return (
    <div className="flex w-full flex-col gap-7 self-start md:sticky md:top-24 md:w-[63%]">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">{product.name}</h1>
        <Rating score={product.score} commentsCount={commentsCount} />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage-400/20 bg-sage-400/5 p-5">
        <Price price={price} originalPrice={originalPrice} />
        <StockBadge inStock={inStock} />
      </div>

      {product.shortDescription && (
        <p className="max-w-prose text-[15px] leading-7 text-gray-600 dark:text-gray-300">{product.shortDescription}</p>
      )}

      <VariantSelector
        options={options}
        variants={product.variants}
        selectedAttributes={selectedAttributes}
        onSelect={select}
      />

      <div className="flex flex-wrap items-stretch gap-3">
        <div className="min-w-[240px] flex-1">
          <AddToBasket
            key={selected?._id ?? "no-variant"}
            productId={product._id}
            variantId={selected?._id ?? null}
            maxQty={selected?.stock}
            disabled={!inStock}
          />
        </div>

        <AddToFavoriteList productId={product._id} initialFavorited={isFavorited} />
      </div>

      {selected?.sku && <p className="-mt-3 text-xs text-gray-500 dark:text-gray-400">SKU: {selected.sku}</p>}

      {product.categories.length > 0 && (
        <p className="-mt-3 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Category:</span>
          {product.categories.map((category) => (
            <Link
              key={category._id ?? category.slug}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className="text-sage-500 hover:text-coral-300 hover:underline"
            >
              {category.title}
            </Link>
          ))}
        </p>
      )}

      <footer className="flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        {product.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">Share</span>
          {shareLinks.map(({ name, Icon, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-sage-400 transition hover:-translate-y-0.5 hover:bg-sage-400 hover:text-white dark:border-white/20"
            >
              <Icon className="text-base" />
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Details;
