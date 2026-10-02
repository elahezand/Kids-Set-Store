import { Suspense } from "react";
import type { Metadata } from "next";
import Banner from "@/components/modules/main/banner";
import PromoText from "@/components/template/main/index/promoText";
import SectionSkeleton from "@/components/template/main/index/sectionSkeleton";
import TrustStrip from "@/components/modules/main/trustStrip";
import GrowthChart from "@/components/template/main/index/growthChart";
import {
  ArticlesSection,
  BestSellersSection,
  CategoriesSection,
  LatestSection,
  MostLovedSection,
  PromoteSection,
} from "@/components/template/main/index/homeSections";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export const metadata: Metadata = {
  title: "SET KIDS | Kids Clothing Store",
  description: "New arrivals, best sellers and stylish outfits for kids — shop online with fast delivery.",
  ...(SITE_URL && { alternates: { canonical: SITE_URL } }),
  openGraph: {
    title: "SET KIDS | Kids Clothing Store",
    description: "New arrivals, best sellers and stylish outfits for kids.",
    type: "website",
  },
};

/*
  The static parts (banner, promo band) render immediately; every data section streams
  in on its own behind a skeleton (see homeSections.tsx).
*/
export default function Home() {
  return (
    <div className="min-h-screen">
      <Banner />
      <TrustStrip />
      <Suspense fallback={<SectionSkeleton />}>
        <LatestSection />
      </Suspense>

      <PromoText />

      <Suspense fallback={<SectionSkeleton />}>
        <BestSellersSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton variant="block" />}>
        <CategoriesSection />
      </Suspense>
      <GrowthChart />

      <Suspense fallback={<SectionSkeleton />}>
        <MostLovedSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton count={3} />}>
        <ArticlesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton variant="block" />}>
        <PromoteSection />
      </Suspense>
    </div>
  );
}
