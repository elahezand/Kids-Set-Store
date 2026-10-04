"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ProductCard from "@/components/modules/main/productCard";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";
import type { ProductCardData } from "@/types";

const BREAKPOINTS = {
  640: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 30 },
};

const RelatedProducts = ({ related = [] }: { related?: ProductCardData[] }) => {
  if (!related.length) return null;

  return (
    <section data-aos="fade-right" className="border-t border-gray-200 pt-10 dark:border-white/10">
      <SectionHeader eyebrow="You may also like" title="Related Products" href={ROUTES.products} />
      <Swiper slidesPerView={2} spaceBetween={16} breakpoints={BREAKPOINTS} rewind className="mySwiper">
        {related.map((item) => (
          <SwiperSlide key={item._id} className="!h-auto py-1">
            <ProductCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default RelatedProducts;