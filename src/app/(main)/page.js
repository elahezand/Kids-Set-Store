import dynamic from "next/dynamic";
import { Suspense } from "react";
import Banner from "@/components/modules/main/banner";
import Categories from "@/components/template/main/index/categories";
import Promote from "@/components/template/main/index/promote";
import PromoText from "@/components/template/main/index/promoText";
import Product from "@/model/product";
import Article from "@/model/article";
import connectToDB from "@/configs/db";

const Latest = dynamic(
  () => import("@/components/template/main/index/latest"),
  {
    loading: () => <SkeletonLoader />,
    ssr: true,
  }
);

const BestSelling = dynamic(
  () => import("@/components/template/main/index/bestSelling"),
  {
    loading: () => <SkeletonLoader />,
    ssr: true,
  }
);

const Articles = dynamic(
  () => import("@/components/template/main/index/articles/articles"),
  {
    loading: () => <SkeletonLoader />,
    ssr: true,
  }
);

function SkeletonLoader() {
  return (
    <div className="h-96 animate-pulse rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
  );
}

export const revalidate = 3600;

export default async function Home() {
  await connectToDB();

  const [products, bestSelling, articles] = await Promise.all([
    Product.find({ status: "active" })
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec(),

    Product.find({
      status: "active",
      "metrics.score": { $gte: 4 },
    })
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec(),

    Article.find({})
      .sort({ _id: -1 })
      .limit(10)
      .lean()
      .exec(),
  ]);

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