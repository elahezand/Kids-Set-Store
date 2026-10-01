"use client";

import Product from "@/components/modules/main/product";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const MAX_SLIDES_PER_VIEW = 5;

/* Product slider (used for "Best Sellers" and "Most Loved" on the home page) */
export default function BestSelling({
    products = [],
    title = "Best Sellers",
    href = "/products?sort=bestSelling",
}) {
    if (!products.length) return null;

    // Swiper loop needs more slides than are visible at once
    const canLoop = products.length > MAX_SLIDES_PER_VIEW;

    return (
        <div className="page-container">
            <SectionHeader title={title} href={href} />
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
                        <Product {...item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
