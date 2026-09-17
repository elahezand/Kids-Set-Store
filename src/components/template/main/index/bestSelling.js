"use client"
import Product from "@/components/modules/main/product";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

export default function BestSelling({ products }) {
    return (
        <div className="page-container">
            <SectionHeader title="Best Products" href="products?value=bestSelling&page=1" />
            <Swiper
                slidesPerView={1}
                spaceBetween={10}
                breakpoints={{
                    640: { slidesPerView: 2, spaceBetween: 16 },
                    768: { slidesPerView: 3, spaceBetween: 20 },
                    1200: { slidesPerView: 5, spaceBetween: 30 },
                }}
                autoplay={{ delay: 1500, disableOnInteraction: false }}
                rewind={true}
                loop={true}
                modules={[Autoplay]}
            >
                {products.length ? products.map((item, index) => (
                    <SwiperSlide key={index + 1} className="!h-auto py-1">
                        <Product {...item} key={index + 1} />
                    </SwiperSlide>
                )) : null}
            </Swiper>
        </div>
    );
}
