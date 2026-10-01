import type { Metadata } from "next";
import connectToDB from "@/configs/db";
import productService from "@/services/server/public/product";
import categoryService from "@/services/server/public/category";
import Breadcrumb from "@/components/modules/main/breadCrumb";
import FilterSection from "@/components/template/main/products/filterSection";
import ProductList from "@/components/template/main/products/productList";
import { listKey, toQuery } from "@/utils/searchParams";
import { toInitialPage } from "@/utils/initialPage";
import type { CategoryDetail, CategoryNode, ListingQuery, PageProps, Pagination, ProductDoc } from "@/types";

const DEFAULT_LIMIT = 12;

type ListingResult = { data: ProductDoc[]; pagination: Pagination };

const getCategory = async (slug?: string) =>
  slug ? ((await categoryService.getCategoryBySlug(slug)) as CategoryDetail | null) : null;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = toQuery<keyof ListingQuery>(await searchParams);

  await connectToDB();
  const category = await getCategory(query.category);
  const filtered = Object.keys(query).some((key) => key !== "category");

  return {
    title: category ? `${category.title} | SET KIDS` : "All Products | SET KIDS",
    description:
      category?.description || (category ? `Explore our ${category.title} collection.` : "Browse our full collection of kids clothing."),
    // filtered / paginated variants should not compete with the main list
    ...(filtered && { robots: { index: false, follow: true } }),
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  await connectToDB();

  const { cursor: _cursor, limit: rawLimit, ...query } = toQuery<keyof ListingQuery>(await searchParams);
  const limit = Math.min(Math.max(Number(rawLimit) || DEFAULT_LIMIT, 1), 50);

  const [tree, category, result] = await Promise.all([
    categoryService.getAllCategories() as Promise<CategoryNode[]>,
    getCategory(query.category),
    productService.getAllProducts({ ...query, limit }) as Promise<ListingResult>,
  ]);

  const title = category?.title || (query.q ? `Search: ${query.q}` : "Products");

  return (
    <div className="page-container">
      <Breadcrumb route="products" title={title} />

      <h1 className="section-title mb-8 capitalize">{title}</h1>

      <FilterSection categories={tree} />

      <ProductList
        key={listKey(query)}
        query={query as ListingQuery}
        initialPage={toInitialPage(result, limit)}
        limit={limit}
      />
    </div>
  );
}
