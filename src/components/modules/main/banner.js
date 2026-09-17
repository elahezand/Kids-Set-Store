"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const themes = {
  coral: {
    bg: "bg-coral-50 dark:bg-ink-800",
    blob: "bg-coral-100 dark:bg-coral-500/15",
    button: "btn-accent",
  },
  sage: {
    bg: "bg-sage-50 dark:bg-ink-800",
    blob: "bg-sage-200 dark:bg-sage-500/15",
    button: "btn-primary",
  },
  mint: {
    bg: "bg-mint-50 dark:bg-ink-800",
    blob: "bg-mint-200 dark:bg-mint-500/15",
    button: "bg-mint-700 text-white shadow-card hover:bg-mint-800 focus-visible:ring-mint-500/25",
  },
  peach: {
    bg: "bg-peach-50 dark:bg-ink-800",
    blob: "bg-peach-200 dark:bg-peach-500/15",
    button: "bg-peach-600 text-white shadow-card hover:bg-peach-700 focus-visible:ring-peach-400/30",
  },
};

const banners = [
  {
    image: "/images/banner/kid-store-3-boys-sitting.png",
    title: "Cool looks for cool boys",
    text: "Jackets, hoodies and denim made for play.",
    cta: "Shop boys",
    href: "/category/boys",
    theme: "sage",
  },
  {
    image: "/images/banner/kid-store-2-girls-group.png",
    title: "Tiny outfits, big smiles",
    text: "Cozy picks for your little one's first adventures.",
    cta: "Shop toddlers",
    href: "/category/toddlers",
    theme: "peach",
  },
  {
    image: "/images/banner/kid-store-1-boys-standing.png",
    title: "Ready for every adventure",
    text: "Everyday essentials kids love to wear.",
    cta: "Shop kids",
    href: "/category/kids",
    theme: "mint",
  },
  {
    image: "/images/banner/kid-store-girls-blue.png",
    title: "Winter blues, warm hearts",
    text: "Fluffy jackets and soft knits for chilly days.",
    cta: "Shop girls",
    href: "/category/girls",
    theme: "coral",
  },
  {
    image: "/images/banner/kid-store-boys-autumn.png",
    title: "Little explorers, autumn ready",
    text: "Boots, jackets and warm layers for cool days.",
    cta: "Shop toddlers",
    href: "/category/toddlers",
    theme: "sage",
  },
];

const reveal =
  "translate-y-4 opacity-0 transition-all duration-700 group-[.swiper-slide-active]:translate-y-0 group-[.swiper-slide-active]:opacity-100";

function Banner() {
  return (
    <section aria-label="Featured categories" className="relative mt-[90px] w-full">
      <Swiper
        loop
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        modules={[Autoplay, EffectFade, Pagination]}
        className="banner-swiper !h-[560px] !w-full overflow-hidden sm:!h-[620px] md:!h-[460px] lg:!h-[540px] xl:!h-[640px]"
      >
        {banners.map((slide, index) => {
          const t = themes[slide.theme];

          return (
            <SwiperSlide
              key={slide.image}
              className={`group !h-full !rounded-none transition-colors duration-300 ${t.bg}`}
            >
              <div className="mx-auto flex h-full max-w-container flex-col justify-between md:flex-row md:items-stretch">
                <div className="relative z-10 flex w-full shrink-0 flex-col items-start justify-center gap-4 px-6 pt-6 sm:px-10 md:w-[40%] md:gap-5 md:py-10 lg:px-8">
                  <h2
                    className={`max-w-[14ch] font-shabnam-bold text-3xl leading-[1.15] text-text-dark dark:text-gray-100 sm:text-4xl lg:text-5xl xl:text-6xl ${reveal} group-[.swiper-slide-active]:delay-200`}
                  >
                    {slide.title}
                  </h2>

                  <p
                    className={`max-w-[36ch] text-base text-gray-700 dark:text-gray-500 lg:text-lg ${reveal} group-[.swiper-slide-active]:delay-300`}
                  >
                    {slide.text}
                  </p>

                  <Link
                    href={slide.href}
                    className={`btn btn-lg mt-1 rounded-full px-7 lg:px-9 lg:py-3.5 ${t.button} ${reveal} group-[.swiper-slide-active]:delay-500`}
                  >
                    {slide.cta}
                  </Link>
                </div>

                <div className="relative min-h-0 w-full flex-1 md:w-[55%] md:flex-none">
                  <div
                    aria-hidden="true"
                    className={`absolute bottom-0 left-1/2 aspect-square w-[95%] max-w-[680px] -translate-x-1/2 translate-y-1/4 rounded-full ${t.blob}`}
                  />
                  <Image
                    fill
                    src={slide.image}
                    alt={`${slide.cta} – ${slide.title}`}
                    priority={index === 0}
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="origin-bottom scale-100 object-contain object-bottom px-2 pt-3 transition-transform duration-1000 group-[.swiper-slide-active]:scale-105 md:px-0 md:pt-6"
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <style jsx global>{`
        .banner-swiper .swiper-pagination {
          bottom: 16px !important;
        }
        .banner-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: var(--color-sage-600);
          opacity: 0.3;
          transition: all 0.3s ease;
        }
        .banner-swiper .swiper-pagination-bullet-active {
          width: 28px;
          border-radius: 9999px;
          background: var(--color-coral-400);
          opacity: 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .banner-swiper * {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Banner;