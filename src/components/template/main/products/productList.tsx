"use client";

import Product from "@/components/modules/main/product";
import LoadMore from "@/components/modules/main/loadMore";
import { useProductListing } from "@/services/client/listing";
import type { ListingQuery, Paginated, ProductDoc } from "@/types";

interface ProductListProps {
  query: ListingQuery;
  initialPage: Paginated<ProductDoc>;
  limit?: number;
}

export default function ProductList({ query, initialPage, limit = 12 }: ProductListProps) {
  const { products, fetchNextPage, hasNextPage, isFetchingNextPage } = useProductListing(
    { ...query, limit: String(limit) },
    initialPage
  );

  if (!products.length) {
    return <p className="py-16 text-center text-gray-700 dark:text-gray-500">No products match your filters.</p>;
  }

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {products.map((item) => (
          <Product key={item._id} {...item} />
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
