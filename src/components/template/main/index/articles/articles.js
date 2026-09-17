"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SectionHeader from "@/components/modules/main/sectionHeader";
import Article from "./article";

const MAX_SLIDES_PER_VIEW = 3;

const Articles = ({ articles = [] }) => {

    const canLoop = articles.length > MAX_SLIDES_PER_VIEW;

    return (
        <div className="page-container">
            <SectionHeader title="Our Articles" href="/articles" />
            {articles.length ? (
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 16 },
                        768: { slidesPerView: 2, spaceBetween: 20 },
                        1200: { slidesPerView: MAX_SLIDES_PER_VIEW, spaceBetween: 30 },
                    }}
                    autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    loop={canLoop}
                    rewind={!canLoop}
                    className="articles-swiper"
                >
                    {articles.map((item) => (
                        <SwiperSlide key={item._id}>
                            <Article {...item} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p className="py-10 text-center text-gray-700 dark:text-gray-500">No articles yet.</p>
            )}
        </div>
    );
};

export default Articles;
