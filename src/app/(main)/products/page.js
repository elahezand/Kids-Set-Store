import connectToDB from "@/configs/db";
import productService from "@/services/public/product";
import categoryService from "@/services/public/category";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import FilterSection from "@/components/template/main/products/filterSection";
import ProductList from "@/components/template/main/products/productList";
import { toProductCards } from "@/utils/productView";

const DEFAULT_LIMIT = 12;

// ?a=1&a=2 gives an array -> keep the first value, only strings
const toQuery = (params = {}) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      .filter(([, value]) => typeof value === "string" && value.trim() !== "")
  );

export async function generateMetadata({ searchParams }) {
  const query = toQuery(await searchParams);

  await connectToDB();
  const category = query.category
    ? await categoryService.getCategoryBySlug(query.category)
    : null;

  const filtered = Object.keys(query).some((key) => key !== "category");

  return {
    title: category ? `${category.title} | SET KIDS` : "All Products | SET KIDS",
    description: category?.description
      ? category.description
      : category
        ? `Explore our ${category.title} collection.`
        : "Browse our full collection of kids clothing.",
    // filtered / paginated variants should not compete with the main list
    ...(filtered && { robots: { index: false, follow: true } }),
  };
}

export default async function Page({ searchParams }) {
  await connectToDB();

  const query = toQuery(await searchParams);
  const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), 50);

  // same service as GET /api/products (filters: category, min, max, color, size, material, q, rating, sort)
  const [tree, category, result] = await Promise.all([
    categoryService.getAllCategories(),
    query.category ? categoryService.getCategoryBySlug(query.category) : null,
    productService.getAllProducts({ ...query, limit }),
  ]);

  // a new filter set = a new list; the cursor only appends to the current one
  const listKey = new URLSearchParams(
    Object.entries(query).filter(([key]) => key !== "cursor")
  ).toString();

  const title = category?.title || (query.q ? `Search: ${query.q}` : "Products");

  return (
    <div className="page-container">
      <Breadcrumb route="products" title={title} />

      <h1 className="section-title mb-8 capitalize">{title}</h1>

      <FilterSection categories={tree} />

      <ProductList
        key={listKey}
        initialProducts={toProductCards(result.data)}
        initialCursor={result.pagination?.nextCursor || null}
        initialHasMore={result.pagination?.hasMore || false}
        limit={limit}
      />
    </div>
  );
}
