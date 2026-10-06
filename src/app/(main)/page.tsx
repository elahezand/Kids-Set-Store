import { Suspense } from "react";
import Hero from "@/components/template/main/index/hero/hero";
import {
  ArticlesSection,
  BestSellersSection,
  CategoriesSection,
  LatestSection,
  PromoteSection,
} from "@/components/template/main/index/homeSections";
import PromoText from "@/components/template/main/index/promoText";
import SaleCord from "@/components/template/main/index/saleCord";
import ScrollStar from "@/components/template/main/index/scrollStar/scrollStar";
import SectionSkeleton from "@/components/template/main/index/sectionSkeleton";
import TrustStrip from "@/components/template/main/index/trustStrip";
import VideoShowcase from "@/components/template/main/index/videoShowcase";
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
    <div>
      <ScrollStar />
      <div>
        <div className="relative">
          <Hero />
          <SaleCord />
        </div>
        <TrustStrip />
      </div>
      <div className="flex min-h-screen flex-col gap-24 pb-24 sm:gap-32 sm:pb-32 lg:gap-58 lg:pb-40 mt-24">
        <Suspense fallback={<SectionSkeleton variant="block" />}>
          <CategoriesSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <LatestSection />
        </Suspense>

        <PromoText />

        <Suspense fallback={<SectionSkeleton />}>
          <BestSellersSection />
        </Suspense>

        <VideoShowcase />

        <Suspense fallback={<SectionSkeleton count={3} />}>
          <ArticlesSection />
        </Suspense>

        <Suspense fallback={<SectionSkeleton variant="block" />}>
          <PromoteSection />
        </Suspense>
      </div>
    </div>
  );
}
