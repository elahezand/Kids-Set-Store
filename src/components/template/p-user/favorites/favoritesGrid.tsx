"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuHeart, LuTrash2 } from "react-icons/lu";
import LoadMore from "@/components/modules/main/loadMore";
import ConfirmDialog from "@/components/modules/ui/confirmDialog";
import EmptyState from "@/components/modules/ui/emptyState";
import Stars from "@/components/modules/ui/stars";
import { useRemoveFavorite } from "@/services/client/favorite";
import { useFavoriteListing } from "@/services/client/listing";
import { ROUTES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type { FavoriteEntry, Paginated, ProductCardData } from "@/types";

interface FavoritesGridProps {
  initialPage: Paginated<FavoriteEntry>;
  limit: number;
}

export default function FavoritesGrid({ initialPage, limit }: FavoritesGridProps) {
  const { products, fetchNextPage, hasNextPage, isFetchingNextPage } = useFavoriteListing(initialPage, limit);
  const [removing, setRemoving] = useState<ProductCardData | null>(null);
  const remove = useRemoveFavorite();

  if (!products.length && !hasNextPage) {
    return (
      <div className="card">
        <EmptyState
          title="No favorites yet"
          description="Tap the heart on any product to save it here."
          icon={LuHeart}
          action={
            <Link href={ROUTES.products} className="btn btn-primary btn-sm">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <article key={product._id} className="card group flex min-w-0 flex-col overflow-hidden">
            <Link
              href={ROUTES.product(product._id)}
              className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-white/5"
            >
              <Image
                fill
                src={product.img}
                alt={product.name}
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
              <Link
                href={ROUTES.product(product._id)}
                className="line-clamp-2 text-sm font-medium text-gray-900 hover:text-sage-700 dark:text-gray-100"
              >
                {product.name}
              </Link>
              <Stars score={product.score} className="text-xs" />
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                <span className="text-sm font-semibold tabular-nums sm:text-base">{formatPrice(product.price)}</span>
                <button
                  type="button"
                  onClick={() => setRemoving(product)}
                  className="btn btn-soft-danger btn-sm btn-icon"
                  aria-label={`Remove ${product.name} from favorites`}
                  title="Remove"
                >
                  <LuTrash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
        count={products.length}
        limit={limit}
        noun="products"
      />

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove from favorites?"
        description={removing?.name}
        confirmLabel="Remove"
        danger
        loading={remove.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing._id, { onSuccess: () => setRemoving(null) })}
      />
    </>
  );
}
