"use client";

import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { countCartItems, useCart } from "@/services/client/cart";

/* Badge = pieces in the server cart; every cart hook updates the same ["cart"] query */
export default function CartCount({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const { data } = useCart({ enabled: isLoggedIn, silent: true });
  const count = isLoggedIn ? countCartItems(data?.data) : 0;

  return (
    <Link href="/cart" className="relative" aria-label={`Cart (${count} items)`}>
      <FaShoppingCart />
      <span className="absolute -left-[9px] -top-[7px] flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-300 px-0.5 text-[10px] leading-none text-white">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
