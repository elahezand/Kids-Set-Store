"use client";

import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import { useFavoriteCount } from "@/services/client/favorite";

interface FavoriteCountProps {
  isLoggedIn?: boolean;
  initialCount?: number;
  badgeClassName?: string;
}

export default function FavoriteCount({
  isLoggedIn = false,
  initialCount = 0,
  badgeClassName = "-left-[9px] -top-[7px] bg-coral-300",
}: FavoriteCountProps) {
  const { data } = useFavoriteCount({ enabled: isLoggedIn, initialCount });
  const count = isLoggedIn ? data?.data?.count ?? 0 : 0;

  return (
    <Link href="/favorites" className="relative" aria-label={`Favorites (${count} items)`}>
      <FaRegHeart />
      <span
        className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-none text-white ${badgeClassName}`}
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
