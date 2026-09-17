"use client";
import Product from "../../../modules/main/product"
import SectionHeader from "../../../modules/main/sectionHeader"
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const MoreProducts = ({ related }) => {
  return (
    <div data-aos="fade-right" className="border-t border-gray-200 pt-10 dark:border-white/10">
      <SectionHeader title="Related Products" href="/products" />
      <Swiper
        slidesPerView={2}
        spaceBetween={16}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 30 },
        }}
        rewind={true}
        className="mySwiper"
      >
        {related?.map((item, index) => (
          <SwiperSlide key={index} className="!h-auto py-1">
            <Product {...item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MoreProducts;
