"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useAddFavorite, useToggleFavorite } from "@/services/client/favorite";

interface AddToFavoriteProps {
  productId: string;
  /** known on the product page (logged-in user) -> the button toggles */
  initialFavorited?: boolean;
  compact?: boolean;
}

export default function AddToFavoriteList({ productId, initialFavorited, compact = false }: AddToFavoriteProps) {
  const canToggle = typeof initialFavorited === "boolean";
  const [isFavorited, setIsFavorited] = useState(Boolean(initialFavorited));

  const toggle = useToggleFavorite({ onChange: setIsFavorited });
  const add = useAddFavorite({ onAdded: () => setIsFavorited(true) });

  const isPending = toggle.isPending || add.isPending;

  const handleClick = () => {
    if (isPending || !productId) return;
    if (canToggle) toggle.mutate({ productId });
    else if (!isFavorited) add.mutate({ productId });
  };

  const label = isFavorited ? "In your favorites" : "Add to favorites";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorited}
      aria-label={label}
      title={label}
      className={
        compact
          ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-lg text-coral-300 transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          : "flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 text-xl text-coral-300 transition hover:border-coral-300 hover:bg-coral-300/10 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-300 dark:border-white/20"
      }
    >
      {isFavorited ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}
