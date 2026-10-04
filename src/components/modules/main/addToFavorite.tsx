"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useFavoriteIds, useToggleFavorite } from "@/services/client/favorite";

interface AddToFavoriteProps {
  productId: string;
  initialFavorited?: boolean;
  compact?: boolean;
}

export default function AddToFavorite({ productId, initialFavorited, compact = false }: AddToFavoriteProps) {
  const { ids, isLoaded } = useFavoriteIds();
  const toggle = useToggleFavorite();

  const isFavorited = isLoaded || initialFavorited === undefined ? ids.has(productId) : initialFavorited;

  const handleClick = () => {
    if (toggle.isPending || !productId) return;
    toggle.mutate({ productId });
  };

  const label = isFavorited ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-pressed={isFavorited}
      aria-label={label}
      title={label}
      className={
        compact
          ? "flex size-9 items-center justify-center rounded-full bg-white text-base text-coral-500 shadow-card transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 dark:bg-ink-800 dark:text-coral-300"
          : "flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 text-xl text-coral-300 transition hover:border-coral-300 hover:bg-coral-300/10 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-300 dark:border-white/20"
      }
    >
      {isFavorited ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}