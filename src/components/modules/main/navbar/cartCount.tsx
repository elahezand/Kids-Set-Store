"use client";

import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { countCartItems, useCart } from "@/services/client/cart";
import { ROUTES } from "@/utils/constants";

export default function CartCount({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const { data } = useCart({ enabled: isLoggedIn, silent: true });
  const count = isLoggedIn ? countCartItems(data?.data) : 0;

  return (
    <Link href={ROUTES.cart} className="relative" aria-label={`Cart (${count} items)`}>
      <FaShoppingCart />
      <span className="absolute -top-[7px] -left-[9px] flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-300 px-0.5 text-[10px] leading-none text-white">
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
