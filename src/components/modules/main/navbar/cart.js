"use client";

import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useGet } from "@/utils/hooks/useReactQuery";

/*
  Badge = number of pieces in the server cart (GET /api/user/cart, query key ["cart"]).
  Every component that changes the cart invalidates ["cart"], so the badge follows.
*/
export default function CartCount({ isLoggedIn = false }) {
    const { data } = useGet("/user/cart", undefined, {
        queryKey: ["cart"],
        enabled: isLoggedIn,
        silentError: true,
        axiosConfig: { silentAuth: true },
        retry: false,
    });

    const count = (data?.data?.items ?? []).reduce(
        (sum, item) => sum + (Number(item.quantity) || 0),
        0
    );

    return (
        <Link href="/cart" className="relative" aria-label={`Cart (${count} items)`}>
            <FaShoppingCart />
            <span className="absolute -left-[9px] -top-[7px] flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-300 px-0.5 text-[10px] leading-none text-white">
                {count > 99 ? "99+" : count}
            </span>
        </Link>
    );
}
