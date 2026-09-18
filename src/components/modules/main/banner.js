"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const AUTOPLAY_DELAY = 6000;
const tints = {
    sage: "bg-sage-50",
    coral: "bg-coral-50",
    mint: "bg-mint-50",
    peach: "bg-peach-50",
};

const banners = [
    {
        image: "/images/banner/banner-1-kids-lineup.webp",
        kicker: "All ages",
        title: "One shop, every age",
        text: "From first steps to fourteen — sizes, fits and fabrics that grow with them.",
        href: "/products",
        tint: "sage",
    },
    {
        image: "/images/banner/banner-2-girls-summer.webp",
        kicker: "Girls",
        title: "Light layers for warm days",
        text: "Breathable cottons, easy dresses and shorts they can run in.",
        href: "/products?category=Girls",
        tint: "peach",
    },
    {
        image: "/images/banner/banner-3-autumn-duo.webp",
        kicker: "Jackets",
        title: "Ready for in-between weather",
        text: "Bombers, puffers and hoodies for mornings that start cold and end warm.",
        href: "/products?category=Kids",
        tint: "mint",
    },
    {
        image: "/images/banner/banner-6-teen-coat.webp",
        kicker: "Winter",
        title: "Coats that keep up",
        text: "Warm, light and easy to move in, from the school run to the park.",
        href: "/products?category=Girls",
        tint: "coral",
    }
];

const reveal =
    "translate-y-3 opacity-0 transition-all duration-700 ease-out group-[.swiper-slide-active]:translate-y-0 group-[.swiper-slide-active]:opacity-100";

function Banner() {
    return (
        <section aria-label="Featured collections" className="full-bleed bg-white dark:bg-ink-900">
            <Swiper
                loop
                effect="fade"
                fadeEffect={{ crossFade: true }}
                speed={900}
                autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false, pauseOnMouseEnter: true }}
                pagination={{ clickable: true }}
                modules={[Autoplay, EffectFade, Pagination]}
                className="banner-swiper !h-[600px] !w-full sm:!h-[620px] md:!h-[520px] lg:!h-[580px] xl:!h-[620px]"
            >
                {banners.map((slide, index) => (
                    <SwiperSlide key={slide.image} className="group !h-full !rounded-none">
                        <div className="container-x grid h-full grid-rows-[auto_1fr] items-center gap-6 md:grid-cols-2 md:grid-rows-1 md:gap-12 lg:gap-20">
                            {/* متن */}
                            <div className="flex flex-col items-start justify-center pt-10 md:pt-0">
                                <span
                                    className={`text-xs font-semibold uppercase tracking-[0.22em] text-gray-600 dark:text-gray-500 ${reveal} group-[.swiper-slide-active]:delay-100`}
                                >
                                    {slide.kicker}
                                </span>

                                <h2
                                    className={`mt-4 max-w-[13ch] font-shabnam-bold text-[2rem] leading-[1.08] tracking-tight text-text-dark dark:text-gray-100 sm:text-5xl lg:text-6xl ${reveal} group-[.swiper-slide-active]:delay-200`}
                                >
                                    {slide.title}
                                </h2>

                                <p
                                    className={`mt-5 max-w-[40ch] text-[15px] leading-7 text-gray-700 dark:text-gray-500 sm:text-base ${reveal} group-[.swiper-slide-active]:delay-300`}
                                >
                                    {slide.text}
                                </p>

                                <div className={`mt-8 flex items-center gap-6 ${reveal} group-[.swiper-slide-active]:delay-500`}>
                                    <Link href={slide.href} className="btn btn-lg btn-primary">
                                        Shop {slide.kicker.toLowerCase()}
                                    </Link>
                                    <Link
                                        href="/products"
                                        className="border-b border-transparent pb-0.5 text-sm font-semibold text-text transition-colors hover:border-current dark:text-gray-300"
                                    >
                                        All products
                                    </Link>
                                </div>
                            </div>

                            {/* عکس روی یک بلوک رنگی ساده */}
                            <div className="relative h-full min-h-0 pb-14 md:pb-0">
                                <div
                                    aria-hidden="true"
                                    className={`absolute inset-x-0 bottom-0 top-8 rounded-t-[999px] ${tints[slide.tint]} md:top-12`}
                                />
                                <Image
                                    fill
                                    src={slide.image}
                                    alt={`${slide.kicker} collection`}
                                    priority={index === 0}
                                    sizes="(min-width: 768px) 50vw, 100vw"
                                    className="origin-bottom scale-[0.97] object-contain object-bottom transition-transform duration-1000 ease-out group-[.swiper-slide-active]:scale-100"
                                />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                /* نشانگرها: خط‌های نازک با نوار پیشرفت، هم‌تراز با ستون متن */
                .banner-swiper .swiper-pagination {
                    bottom: 24px !important;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                @media (min-width: 768px) {
                    .banner-swiper .swiper-pagination {
                        left: 50% !important;
                        width: 100%;
                        max-width: var(--container-container);
                        transform: translateX(-50%);
                        justify-content: flex-start;
                        padding-inline: 1.5rem;
                    }
                }

                @media (min-width: 1024px) {
                    .banner-swiper .swiper-pagination {
                        padding-inline: 2rem;
                    }
                }

                .banner-swiper .swiper-pagination-bullet {
                    position: relative;
                    width: 44px;
                    height: 2px;
                    margin: 0 !important;
                    overflow: hidden;
                    border-radius: 999px;
                    background: var(--color-gray-400);
                    opacity: 1;
                }

                html.dark .banner-swiper .swiper-pagination-bullet {
                    background: rgb(255 255 255 / 0.2);
                }

                .banner-swiper .swiper-pagination-bullet-active::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: var(--color-sage-600);
                    transform-origin: left;
                    animation: banner-progress 6000ms linear forwards;
                }

                @keyframes banner-progress {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .banner-swiper .swiper-pagination-bullet-active::after {
                        animation: none;
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </section>
    );
}

export default Banner;