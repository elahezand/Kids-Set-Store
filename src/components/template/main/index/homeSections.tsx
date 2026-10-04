import ArticlesSlider from "@/components/template/main/index/articlesSlider";
import Categories from "@/components/template/main/index/categories";
import Latest from "@/components/template/main/index/latest";
import ProductSlider from "@/components/template/main/index/productSlider";
import Promote from "@/components/template/main/index/promote/promote";
import connectToDB from "@/configs/db";
import articleService from "@/services/server/public/article";
import categoryService from "@/services/server/public/category";
import productService from "@/services/server/public/product";
import statService from "@/services/server/public/stats";
import { toPlain } from "@/utils/format";
import { toProductCards } from "@/utils/productView";
import type { ArticleSummary, CategoryNode, ProductDoc, PublicStats } from "@/types";

const HOME_LIMIT = 15;

async function load<T>(label: string, query: () => Promise<unknown>, fallback: T): Promise<T> {
  try {
    await connectToDB();
    return ((await query()) as T) ?? fallback;
  } catch (error) {
    console.error(`[home] ${label} failed:`, error);
    return fallback;
  }
}

export async function LatestSection() {
  const products = await load<ProductDoc[]>("latest", () => productService.getLatestProducts(HOME_LIMIT), []);
  return <Latest products={toProductCards(products)} />;
}

export async function BestSellersSection() {
  const products = await load<ProductDoc[]>(
    "best sellers",
    () => productService.getBestSellingProducts(HOME_LIMIT),
    []
  );
  if (!products.length) return null;

  return (
    <ProductSlider
      eyebrow="Popular right now"
      title="Best Sellers"
      href="/products?sort=bestSelling"
      products={toProductCards(products)}
    />
  );
}

export async function CategoriesSection() {
  const categories = await load<CategoryNode[]>("categories", () => categoryService.getAllCategories(), []);
  return <Categories categories={toPlain(categories.slice(0, 5))} />;
}

export async function MostLovedSection() {
  const products = await load<ProductDoc[]>("most loved", () => productService.getPopularProducts(HOME_LIMIT), []);
  if (!products.length) return null;

  return (
    <ProductSlider
      eyebrow="Top rated"
      title="Most Loved"
      href="/products?sort=popularity"
      products={toProductCards(products)}
    />
  );
}

export async function ArticlesSection() {
  const result = await load<{ data: ArticleSummary[] }>(
    "articles",
    () => articleService.getPublicArticles({ limit: HOME_LIMIT }),
    { data: [] }
  );
  if (!result.data?.length) return null;

  return <ArticlesSlider articles={toPlain(result.data)} />;
}

export async function PromoteSection() {
  const stats = await load<PublicStats | null>("stats", () => statService.getPublicStats(), null);
  return <Promote stats={toPlain(stats)} />;
}