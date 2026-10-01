import dynamic from "next/dynamic";
import Banner from "@/components/modules/main/banner";
import Categories from "@/components/template/main/index/categories";
import Promote from "@/components/template/main/index/promote";
import PromoText from "@/components/template/main/index/promoText";
import connectToDB from "@/configs/db";
import productService from "@/services/server/public/product";
import articleService from "@/services/server/public/article";
import { getAllCategories } from "@/services/server/public/category";
import { getPopularProducts } from "@/services/server/public/favorite";
import { getPublicStats } from "@/services/server/public/stats";
import { toProductCards } from "@/utils/productView";
import { toPlain } from "@/utils/format";
import type { ArticleSummary, CategoryNode, ProductDoc, PublicStats } from "@/types";

function SkeletonLoader() {
  return (
    <div className="page-container">
      <div className="h-96 animate-pulse rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
    </div>
  );
}

const Latest = dynamic(() => import("@/components/template/main/index/latest"), {
  loading: () => <SkeletonLoader />,
});
const ProductSlider = dynamic(() => import("@/components/template/main/index/bestSelling"), {
  loading: () => <SkeletonLoader />,
});
const Articles = dynamic(() => import("@/components/template/main/index/articles/articles"), {
  loading: () => <SkeletonLoader />,
});

const HOME_LIMIT = 10;

// one broken section must not take the whole home page down
async function safe<T>(promise: Promise<unknown>, fallback: T): Promise<T> {
  try {
    return (await promise) as T;
  } catch (error) {
    console.error("[home] section failed:", error);
    return fallback;
  }
}

export default async function Home() {
  await connectToDB();

  // same server services the public API uses
  const [latest, bestSelling, popular, articles, categories, stats] = await Promise.all([
    safe<ProductDoc[]>(productService.getLatestProducts(HOME_LIMIT), []),
    safe<ProductDoc[]>(productService.getBestSellingProducts(HOME_LIMIT), []),
    safe<ProductDoc[]>(getPopularProducts({ limit: HOME_LIMIT }), []),
    safe<{ data: ArticleSummary[] }>(articleService.getPublicArticles({ limit: HOME_LIMIT }), { data: [] }),
    safe<CategoryNode[]>(getAllCategories(), []),
    safe<PublicStats | null>(getPublicStats(), null),
  ]);

  return (
    <div className="min-h-screen">
      <Banner />

      <Latest products={toProductCards(latest)} />

      <PromoText />

      <ProductSlider title="Best Sellers" href="/products?sort=bestSelling" products={toProductCards(bestSelling)} />

      <Categories categories={categories.slice(0, 4)} />

      {popular.length > 0 && (
        <ProductSlider title="Most Loved" href="/products?sort=popularity" products={toProductCards(popular)} />
      )}

      <Articles articles={toPlain(articles.data ?? [])} />

      <Promote stats={stats} />
    </div>
  );
}
