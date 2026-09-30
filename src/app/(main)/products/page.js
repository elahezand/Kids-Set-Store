import { cache } from "react";
import connectToDB from "@/configs/db";
import CategoryModel from "@/model/category";
import Product from "@/model/product";
import { buildProductQuery } from "@/utils/productQuery";
import { paginate } from "@/utils/paginate";
import FilterSection from "@/components/template/main/products/filterSection";
import ProductList from "@/components/template/main/products/productList";

const LIMIT = 12;
const MAX_LIMIT = 50;

const getLimit = (value) =>
  Math.min(Math.max(Number(value) || LIMIT, 1), MAX_LIMIT);

const getCategoryBySlug = cache(async (slug) => {
  if (!slug) return null;

  await connectToDB();

  return CategoryModel.findOne({ slug: String(slug).toLowerCase() })
    .select("name slug")
    .lean();
});

export async function generateMetadata({ searchParams }) {
  const params = (await searchParams) || {};
  const category = await getCategoryBySlug(params.category);

  return {
    title: category ? `${category.name} Products | SET KIDS` : "All Products | SET KIDS",
    description: category
      ? `Explore our ${category.name} products.`
      : "Browse our full collection of products.",
  };
}

export default async function Page({ searchParams }) {
  await connectToDB();

  const params = (await searchParams) || {};
  const limit = getLimit(params.limit);

  const [tree, category, { filters, sort }] = await Promise.all([
    CategoryModel.getTree(),
    getCategoryBySlug(params.category),
    buildProductQuery(params),
  ]);

  const result = await paginate(Product, {
    limit,
    cursor: params.cursor || null,
    filters,
    sort,
  });

  const products = JSON.parse(JSON.stringify(result.data || []));

  const queryString = new URLSearchParams(
    Object.entries(params).filter(
      ([key, value]) => key !== "cursor" && typeof value === "string"
    )
  ).toString();

  return (
    <div className="page-container">
      <h1 className="section-title mb-8 capitalize">
        {category?.name || "Products"}
      </h1>

      <FilterSection categories={tree} />

      <ProductList
        key={queryString}
        initialProducts={products}
        initialCursor={result.pagination?.nextCursor || null}
        initialHasMore={result.pagination?.hasMore || false}
        limit={limit}
      />
    </div>
  );
}