"use client";

import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { toast } from "sonner";
import { usePost } from "@/utils/hooks/useReactQuery";

export default function AddToFavoriteList({ productId }) {
    const [added, setAdded] = useState(false);

    const { mutate, isPending } = usePost("/user/favorites", {
        onSuccess: () => {
            setAdded(true);
            toast.success("Product added to favorites");
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ?? "Something went wrong"
            );
        },
    });

    const handleClick = () => {
        if (added || isPending) return;
        mutate({ productId });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            aria-pressed={added}
            aria-label={added ? "In your favorites" : "Add to favorites"}
            title={added ? "In your favorites" : "Add to favorites"}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 text-xl text-coral-300 transition hover:border-coral-300 hover:bg-coral-300/10 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-300 dark:border-white/20"
        >
            {added ? <FaHeart /> : <FaRegHeart />}
        </button>
    );
}