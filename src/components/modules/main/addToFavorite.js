"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";

/*
  Favorite button (services/user/favorite).
  - initialFavorited known (product page, rendered with the user)  -> POST /user/favorites/toggle
  - unknown (product cards)                                         -> POST /user/favorites
    a 409 "Already in favorites" just means it is already there.
*/
export default function AddToFavoriteList({
    productId,
    initialFavorited,
    compact = false,
}) {
    const canToggle = typeof initialFavorited === "boolean";
    const [isFavorited, setIsFavorited] = useState(Boolean(initialFavorited));

    const showError = (error) => {
        if (error?._authToastShown) return;
        toast.error(error?.response?.data?.message ?? "Something went wrong");
    };

    const { mutate: toggle, isPending: isToggling } = usePost(
        "/user/favorites/toggle",
        {
            onSuccess: (res) => {
                const next = Boolean(res?.data?.isFavorited);
                setIsFavorited(next);
                toast.success(next ? "Added to favorites" : "Removed from favorites");
            },
            onError: showError,
        }
    );

    const { mutate: add, isPending: isAdding } = usePost("/user/favorites", {
        onSuccess: () => {
            setIsFavorited(true);
            toast.success("Added to favorites");
        },
        onError: (error) => {
            if (error?.response?.status === 409) {
                setIsFavorited(true);
                toast.info("Already in your favorites");
                return;
            }
            showError(error);
        },
    });

    const isPending = isToggling || isAdding;

    const handleClick = () => {
        if (isPending || !productId) return;
        if (canToggle) toggle({ productId });
        else if (!isFavorited) add({ productId });
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
