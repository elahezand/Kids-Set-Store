"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import ArticleCard from "@/components/modules/main/article/articleCard";
import SectionHeader from "@/components/modules/main/sectionHeader";
import { ROUTES } from "@/utils/constants";
import type { ArticleSummary } from "@/types";

const MAX_SLIDES_PER_VIEW = 4;

const ArticlesSlider = ({ articles = [] }: { articles?: ArticleSummary[] }) => {
  const canLoop = articles.length > MAX_SLIDES_PER_VIEW;

  return (
    <div className="home-container">
      <SectionHeader eyebrow="From the journal" title="Our Articles" href={ROUTES.articles} />
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
          className="!py-4"
        >
          {articles.map((item) => (
            <SwiperSlide key={item._id}>
              <ArticleCard {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="py-10 text-center text-gray-700 dark:text-gray-500">No articles yet.</p>
      )}
    </div>
  );
};

export default ArticlesSlider;
