"use client";

import Gallery from "@/components/template/main/product/gallery";
import Details from "@/components/template/main/product/detail";
import Tabs from "@/components/template/main/product/tabs";
import { useVariantSelection } from "@/services/client/product";
import type { ProductView } from "@/types";

interface ProductContentProps {
  product: ProductView;
  commentsCount: number;
  isFavorited?: boolean;
}

const ProductContent = ({ product, commentsCount, isFavorited }: ProductContentProps) => {
  const selection = useVariantSelection(product);

  return (
    <>
      <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">
        <Gallery images={product.images} title={product.name} />
        <Details
          product={product}
          commentsCount={commentsCount}
          selection={selection}
          isFavorited={isFavorited}
        />
      </div>

      <Tabs longDescription={product.longDescription} specs={product.specs} />
    </>
  );
};

export default ProductContent;
