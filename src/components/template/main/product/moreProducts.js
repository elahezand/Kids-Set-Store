"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Product from "@/components/modules/main/product";
import SectionHeader from "@/components/modules/main/sectionHeader";

const BREAKPOINTS = {
  640: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 30 },
};

const MoreProducts = ({ related = [] }) => {
  if (!related.length) return null;

  return (
    <section
      data-aos="fade-right"
      className="border-t border-gray-200 pt-10 dark:border-white/10">
      <SectionHeader title="Related Products" href="/products" />
      <Swiper
        slidesPerView={2}
        spaceBetween={16}
        breakpoints={BREAKPOINTS}
        rewind
        className="mySwiper"
      >
        {related.map((item) => (
          <SwiperSlide key={item._id} className="!h-auto py-1">
            <Product {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default MoreProducts;