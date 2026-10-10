"use client";

import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { useAddToCart } from "@/services/client/cart";

const MIN_QTY = 1;

interface AddToBasketProps {
  productId: string;
  variantId?: string | null;
  maxQty?: number;
  disabled?: boolean;
}

export default function AddToBasket({ productId, variantId = null, maxQty, disabled = false }: AddToBasketProps) {
  const [count, setCount] = useState(MIN_QTY);
  const { mutate: addToCart, isPending } = useAddToCart();

  const limit = maxQty && maxQty > 0 ? maxQty : Infinity;

  const handleAdd = () => {
    if (disabled || isPending) return;
    if (!productId) {
      toast.error("Product is missing");
      return;
    }
    addToCart({ items: [{ productId, variantId, quantity: count }] });
  };

  const stepperBtn =
    "flex h-full w-10 items-center justify-center text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";

  return (
    <div className="flex w-full items-stretch gap-3">
      <div
        className={`flex h-12 items-center overflow-hidden rounded-xl border-2 border-gray-200 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setCount((c) => Math.max(MIN_QTY, c - 1))}
          disabled={disabled || count <= MIN_QTY}
          aria-label="Decrease quantity"
          className={stepperBtn}
        >
          <FiMinus />
        </button>

        <output aria-live="polite" className="w-10 select-none text-center font-semibold">
          {count}
        </output>

        <button
          type="button"
          onClick={() => setCount((c) => Math.min(limit, c + 1))}
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
        {disabled ? "Out of stock" : isPending ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
