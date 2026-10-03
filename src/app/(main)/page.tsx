import { Suspense } from "react";
import GrowthChart from "@/components/template/main/index/growthChart";
import Hero from "@/components/template/main/index/hero/hero";
import {
  ArticlesSection,
  BestSellersSection,
  CategoriesSection,
  LatestSection,
  MostLovedSection,
  PromoteSection,
} from "@/components/template/main/index/homeSections";
import PromoText from "@/components/template/main/index/promoText";
import SaleCord from "@/components/template/main/index/saleCord";
import SectionSkeleton from "@/components/template/main/index/sectionSkeleton";
import TrustStrip from "@/components/template/main/index/trustStrip";
import { SITE_URL } from "@/utils/constants";
import type { Metadata } from "next";

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

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="relative">
        <Hero />
        <SaleCord />
      </div>
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
