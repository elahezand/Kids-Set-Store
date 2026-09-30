"use client";

import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/utils/hooks/useReactQuery";

const MIN_QTY = 1;

export default function AddToBasket({
    productId,
    variantId = null,
    maxQty,
    disabled = false,
}) {
    const queryClient = useQueryClient();
    const [count, setCount] = useState(MIN_QTY);

    const limit = maxQty > 0 ? maxQty : Infinity;

    const { mutate, isPending } = usePost("/user/cart", {
        errorFallback: "Could not add to cart",
        onSuccess: async () => {
            toast.success("Added to cart");
            await queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
    });

    const decrease = () => setCount((c) => Math.max(MIN_QTY, c - 1));
    const increase = () => setCount((c) => Math.min(limit, c + 1));

    const handleAdd = () => {
        if (disabled || isPending) return;

        if (!productId) {
            console.error("[AddToBasket] productId is missing");
            toast.error("Product is missing");
            return;
        }

        mutate({
            items: [{ productId, variantId, quantity: count }],
        });
    };

    const stepperBtn =
        "flex h-full w-10 items-center justify-center text-coral-300 transition hover:bg-coral-300/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-300";

    return (
        <div className="flex w-full items-stretch gap-3">
            <div
                className={`flex h-12 items-center overflow-hidden rounded-xl border-2 border-coral-300 ${
                    disabled ? "opacity-50" : ""
                }`}
            >
                <button
                    type="button"
                    onClick={decrease}
                    disabled={disabled || count <= MIN_QTY}
                    aria-label="Decrease quantity"
                    className={stepperBtn}
                >
                    <FiMinus />
                </button>

                <output
                    aria-live="polite"
                    className="w-10 select-none text-center font-semibold"
                >
                    {count}
                </output>

                <button
                    type="button"
                    onClick={increase}
                    disabled={disabled || count >= limit}
                    aria-label="Increase quantity"
                    className={stepperBtn}
                >
                    <FiPlus />
                </button>
            </div>

            <button
                type="button"
                onClick={handleAdd}
                disabled={disabled || isPending}
                className="btn btn-primary h-12 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {disabled
                    ? "Out of stock"
                    : isPending
                      ? "Adding..."
                      : "Add to Cart"}
            </button>
        </div>
    );
}