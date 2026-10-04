"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ProductCard from "@/components/modules/main/productCard";
import SectionHeader from "@/components/modules/main/sectionHeader";
import type { ProductCardData } from "@/types";

interface ProductSliderProps {
  products?: ProductCardData[];
  title?: string;
  eyebrow?: string;
  href?: string;
}

const MAX_SLIDES_PER_VIEW = 5;

export default function ProductSlider({
  products = [],
  title = "Best Sellers",
  eyebrow,
  href = "/products?sort=bestSelling",
}: ProductSliderProps) {
  if (!products.length) return null;

  const canLoop = products.length > MAX_SLIDES_PER_VIEW;

  return (
    <div className="page-container">
      <SectionHeader eyebrow={eyebrow} title={title} href={href} />
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 20 },
          1200: { slidesPerView: MAX_SLIDES_PER_VIEW, spaceBetween: 30 },
        }}
        autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={canLoop}
        rewind={!canLoop}
        modules={[Autoplay]}
      >
        {products.map((item) => (
          <SwiperSlide key={item._id} className="!h-auto py-1">
            <ProductCard {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}