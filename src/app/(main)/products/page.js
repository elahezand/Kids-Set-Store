import { handleTree } from "@/utils/tree";
import { buildProductQuery } from "@/utils/productQuery";

import CategoryModel from "../../../../model/category";
import Listing from "../../../../model/product";

import FilterSection from "@/components/template/main/products/filterSection";
import ProductList from "@/components/template/main/products/productList";
import connectToDB from "../../../../configs/db";
import { paginate } from "@/utils/paginate";


export async function generateMetadata({ searchParams }) {
    await connectToDB();
    const params = await searchParams;
    const categoryName = params?.category || "Products";

    const category = await CategoryModel.findOne({ slug: categoryName }).select("name").lean();

    return {
        title: category ? `${category.name} Products | SET KIDS` : "All Products | SET KIDS",
        description: category
            ? `Explore our ${category.name} products.`
            : "Browse our full collection of products.",
    };
}

export default async function Page({ searchParams }) {
    await connectToDB();

    const params = await searchParams;
    const tree = await handleTree();
    const { filters, sort } = await buildProductQuery(params);

    const categoryName = params?.category;

    const result = await paginate(Listing, {
        limit: Number(params?.limit),
        cursor: params?.cursor || null,
        filters,
        sort,
    });

    const products = JSON.parse(JSON.stringify(result.data || []));
    const queryString = new URLSearchParams(
        Object.entries(params || {}).filter(([key, value]) => key !== "cursor" && typeof value === "string")
    ).toString();

    return (
        <div className="page-container">
            <h1 className="section-title mb-8 capitalize">
                {categoryName ? categoryName.replace(/-/g, " ") : "Products"}
            </h1>

            <FilterSection categories={tree} />
            <ProductList
                key={queryString}
                initialProducts={products}
                initialCursor={result.pagination?.nextCursor || null}
                initialHasMore={result.pagination?.hasMore || false}
                limit={Number(params?.limit)}
            />
        </div>
    );
}