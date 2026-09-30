"use client";

import { useState } from "react";
import Gallery from "@/components/template/main/product/gallery";
import Details from "@/components/template/main/product/detail";
import Tabs from "@/components/template/main/product/tabs";

const ProductContent = ({
    product,
    productComments,
}) => {
    const [selectedVariant, setSelectedVariant] =
        useState(product.variants?.[0] || null);

    return (
        <>
            <div className="flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-14">
                <Gallery
                    images={
                        product.images?.length
                            ? product.images
                            : []
                    }
                    title={product.name}
                />

                <Details
                    productComments={productComments}
                    product={product}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                />
            </div>

            <Tabs
                description={product.longDescription}
                variants={product.variants}
                selectedVariant={selectedVariant}
            />
        </>
    );
};

export default ProductContent;
