// ✅ app/(main)/page.js - Fixed
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Banner from "@/components/modules/main/banner";
import Categories from "@/components/template/main/index/categories";
import Promote from "@/components/template/main/index/promote";
import PromoText from "@/components/template/main/index/promoText";
import ProductModal from "../../../model/product";
import ArticleModel from "../../../model/article";
import connectToDB from "../../../configs/db";

// Lazy load components - Remove ssr: false from Server Component
const Latest = dynamic(
  () => import("@/components/template/main/index/latest"),
  { 
    loading: () => <SkeletonLoader />,
    ssr: true  // ✅ Server-side rendering enabled
  }
);

const BestSelling = dynamic(
  () => import("@/components/template/main/index/bestSelling"),
  { 
    loading: () => <SkeletonLoader />,
    ssr: true  // ✅ Server-side rendering enabled
  }
);

const Articles = dynamic(
  () => import("@/components/template/main/index/articles/articles"),
  { 
    loading: () => <SkeletonLoader />,
    ssr: true  // ✅ Changed from false to true
  }
);

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="h-96 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-lg" />
  );
}

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
    await connectToDB();

    // Parallel database queries
    const [products, bestSelling, articles] = await Promise.all([
      ProductModal.find({})
        .sort({ _id: -1 })
        .limit(10)
        .lean()
        .exec(),
      ProductModal.find({ score: { $gte: 4 } })
        .sort({ _id: -1 })
        .limit(10)
        .lean()
        .exec(),
      ArticleModel.find({})
        .sort({ _id: -1 })
        .limit(10)
        .lean()
        .exec(),
    ]);

    // Serialize data once
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedBestSelling = JSON.parse(JSON.stringify(bestSelling));
    const serializedArticles = JSON.parse(JSON.stringify(articles));

    return (
      <main className="min-h-screen">
        <Banner />
        
        <Suspense fallback={<SkeletonLoader />}>
          <Latest products={serializedProducts} />
        </Suspense>

        <PromoText />

        <Suspense fallback={<SkeletonLoader />}>
          <BestSelling products={serializedBestSelling} />
        </Suspense>

        <Categories />

        <Suspense fallback={<SkeletonLoader />}>
          <Articles articles={serializedArticles} />
        </Suspense>

        <Promote />
      </main>
    );
 
}