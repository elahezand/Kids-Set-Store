"use client";

import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import LoadMore from "@/components/modules/main/loadMore";
import ProductCard from "@/components/modules/main/productCard";
import { useFavoriteListing } from "@/services/client/listing";
import { ROUTES } from "@/utils/constants";
import type { FavoriteEntry, Paginated } from "@/types";

interface FavoriteItemsProps {
  initialPage: Paginated<FavoriteEntry>;
  limit?: number;
}

export default function FavoriteItems({ initialPage, limit = 20 }: FavoriteItemsProps) {
  const { products, fetchNextPage, hasNextPage, isFetchingNextPage } = useFavoriteListing(initialPage, limit);

  if (!products.length && !hasNextPage) {
    return (
      <div className="py-8 text-center leading-tight text-text dark:text-gray-100" data-aos="fade-up">
        <FaRegHeart className="mx-auto text-[7rem] text-sage-300 sm:text-[9rem] md:text-[10rem]" />
        <p className="mb-3 mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">No Product Found</p>
        <span className="mb-1.5 block text-gray-600 dark:text-gray-400">
          You do not have any products in your favorites list yet.
        </span>
        <span className="mb-8 block text-gray-600 dark:text-gray-400">
          You will find lots of interesting products in the shop.
        </span>
        <Link href={ROUTES.products} className="btn btn-accent">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {products.map((item) => (
          <ProductCard key={item._id} {...item} />
        ))}
      </div>
      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        count={products.length}
        limit={limit}
        noun="products"
      />
    </>
  );
}
