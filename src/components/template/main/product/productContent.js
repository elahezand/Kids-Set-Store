"use client";

import { useState } from "react";
import Gallery from "@/components/template/main/product/gallery";
import Details from "@/components/template/main/product/detail";
import Tabs from "@/components/template/main/product/tabs";

const ProductContent = ({ product, commentsCount, isFavorited }) => {
    const [selectedVariant, setSelectedVariant] = useState(
        () =>
            product.variants.find((v) => v._id === product.defaultVariantId) ??
            null
    );

    return (
        <>
            <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">
                <Gallery images={product.images} title={product.name} />

                <Details
                    product={product}
                    productComments={commentsCount}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                    isFavorited={isFavorited}
                />
            </div>

            <Tabs
                longDescription={product.longDescription}
                specs={product.specs}
            />
        </>
    );
};

export default ProductContent;