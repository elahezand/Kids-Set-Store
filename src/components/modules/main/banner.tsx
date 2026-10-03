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
    sage: { arch: "bg-sage-100 dark:bg-sage-500/15", ring: "border-sage-300", dot: "bg-sage-400", sticker: "bg-sage-600" },
    coral: { arch: "bg-coral-100 dark:bg-coral-500/15", ring: "border-coral-300", dot: "bg-coral-400", sticker: "bg-coral-600" },
} as const;

type Tint = keyof typeof tints;

const banners: Array<{
    image: string;
    kicker: string;
    title: string;
    text: string;
    href: string;
    tint: Tint;
    sticker: string;
}> = [
    {
        image: "/images/banner/banner-1-kids-lineup.webp",
        kicker: "All ages",
        title: "One shop, every age",
        text: "From first steps to fourteen — sizes, fits and fabrics that grow with them.",
        href: "/products",
        tint: "sage",
        sticker: "0–14 yrs",
    },
    {
        image: "/images/banner/banner-2-girls-summer.webp",
        kicker: "Girls",
        title: "Light layers for warm days",
        text: "Breathable cottons, easy dresses and shorts they can run in.",
        href: "/products?category=Girls",
        tint: "coral",
        sticker: "Summer",
    },
    {
        image: "/images/banner/banner-3-autumn-duo.webp",
        kicker: "Jackets",
        title: "Ready for in-between weather",
        text: "Bombers, puffers and hoodies for mornings that start cold and end warm.",
        href: "/products?category=Kids",
        tint: "sage",
        sticker: "New in",
    }
];

const reveal =
    "translate-y-3 opacity-0 transition-all duration-700 ease-out group-[.swiper-slide-active]:translate-y-0 group-[.swiper-slide-active]:opacity-100";

/* little hand-drawn shapes that float around the photo */
const Star = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
            fill="currentColor"
            d="M12 2.5l2.6 6.1 6.6.5-5 4.3 1.6 6.4L12 16.3 6.2 19.8l1.6-6.4-5-4.3 6.6-.5z"
        />
    </svg>
);

const Squiggle = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 120 16" fill="none" preserveAspectRatio="xMinYMid meet" aria-hidden="true" className={className}>
        <path
            d="M2 9c10-8 20 8 30 0s20-8 30 0 20 8 30 0 16-6 26-1"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
        />
    </svg>
);

function Banner() {
    return (
        <section aria-label="Featured collections" className="full-bleed overflow-hidden bg-white dark:bg-ink-900">
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
                {banners.map((slide, index) => {
                    const tint = tints[slide.tint];

                    return (
                        <SwiperSlide key={slide.image} className="group !h-full !rounded-none">
                            <div className="container-x grid h-full grid-rows-[auto_1fr] items-center gap-6 md:grid-cols-2 md:grid-rows-1 md:gap-12 lg:gap-20">
                                {/* text */}
                                <div className="relative flex flex-col items-start justify-center pt-10 md:pt-0">
                                    {/* kicker as a pill with a colored dot */}
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-coral-600 shadow-card ring-1 ring-coral-100 dark:bg-ink-800 dark:text-coral-300 dark:ring-white/10 ${reveal} group-[.swiper-slide-active]:delay-100`}
                                    >
                                        <span className={`size-2 rounded-full ${tint.dot}`} aria-hidden="true" />
                                        {slide.kicker}
                                    </span>

                                    <h2
                                        className={`mt-4 max-w-[13ch] font-shabnam-bold text-[2rem] leading-[1.08] tracking-tight text-text-dark dark:text-gray-100 sm:text-5xl lg:text-6xl ${reveal} group-[.swiper-slide-active]:delay-200`}
                                    >
                                        {slide.title}
                                    </h2>

                                    {/* playful underline under the title */}
                                    <Squiggle
                                        className={`mt-3 h-3 w-28 text-coral-300 sm:w-36 ${reveal} group-[.swiper-slide-active]:delay-300`}
                                    />

                                    <p
                                        className={`mt-4 max-w-[40ch] text-[15px] leading-7 text-gray-700 dark:text-gray-500 sm:text-base ${reveal} group-[.swiper-slide-active]:delay-300`}
                                    >
                                        {slide.text}
                                    </p>

                                    <div className={`mt-8 flex items-center gap-6 ${reveal} group-[.swiper-slide-active]:delay-500`}>
                                        <Link href={slide.href} className="btn btn-lg btn-primary btn-pop">
                                            Shop {slide.kicker.toLowerCase()}
                                        </Link>
                                        <Link
                                            href="/products"
                                            className="border-b-2 border-dashed border-coral-300 pb-0.5 text-sm font-semibold text-text transition-colors hover:border-solid hover:text-coral-600 dark:text-gray-300"
                                        >
                                            All products
                                        </Link>
                                    </div>
                                </div>

                                {/* photo on a soft arch, with a dashed outline arch behind it */}
                                <div className="relative h-full min-h-0 pb-14 md:pb-0">
                                    <div
                                        aria-hidden="true"
                                        className={`absolute inset-x-3 -bottom-3 top-5 rounded-t-[999px] border-2 border-dashed ${tint.ring} opacity-70 md:top-9 dark:opacity-30`}
                                    />
                                    <div
                                        aria-hidden="true"
                                        className={`absolute inset-x-0 bottom-0 top-8 rounded-t-[999px] ${tint.arch} md:top-12`}
                                    >
                                        {/* confetti dots inside the arch */}
                                        <span className="absolute inset-0 rounded-t-[999px] bg-[radial-gradient(circle,rgb(255_255_255/0.7)_1.5px,transparent_1.6px)] bg-[length:22px_22px] opacity-70 dark:opacity-10" />
                                    </div>

                                    {/* floating shapes */}
                                    <Star className="banner-float absolute top-16 left-2 z-10 size-7 text-coral-400 md:top-20 md:-left-4 md:size-9" />
                                    <Star className="banner-float-slow absolute right-6 bottom-24 z-10 size-5 text-sage-400 md:bottom-28 md:size-6" />
                                    <span
                                        aria-hidden="true"
                                        className="banner-float-slow absolute top-1/3 -right-1 z-10 size-4 rounded-full bg-coral-300 md:size-5"
                                    />

                                    <Image
                                        fill
                                        src={slide.image}
                                        alt={`${slide.kicker} collection`}
                                        priority={index === 0}
                                        sizes="(min-width: 768px) 50vw, 100vw"
                                        className="origin-bottom scale-[0.97] object-contain object-bottom transition-transform duration-1000 ease-out group-[.swiper-slide-active]:scale-100"
                                    />

                                    {/* round sticker on the photo */}
                                    <span
                                        className={`absolute bottom-20 left-0 z-10 flex size-20 -rotate-12 items-center justify-center rounded-full text-center text-sm leading-tight font-bold text-white shadow-float ring-4 ring-white transition-transform duration-500 group-hover:rotate-0 sm:size-24 sm:text-base md:bottom-10 dark:ring-ink-900 ${tint.sticker} ${reveal} group-[.swiper-slide-active]:delay-700`}
                                    >
                                        {slide.sticker}
                                    </span>
                                </div>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            <style jsx global>{`
                /* indicators: thin lines with a progress bar, aligned with the text column */
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
                    height: 4px;
                    margin: 0 !important;
                    overflow: hidden;
                    border-radius: 999px;
                    background: var(--color-sage-100);
                    opacity: 1;
                }

                html.dark .banner-swiper .swiper-pagination-bullet {
                    background: rgb(255 255 255 / 0.2);
                }

                .banner-swiper .swiper-pagination-bullet-active::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    background: linear-gradient(90deg, var(--color-sage-500), var(--color-coral-400));
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

                /* the stars / dots bob gently */
                .banner-float {
                    animation: banner-float 4s ease-in-out infinite;
                }
                .banner-float-slow {
                    animation: banner-float 6s ease-in-out infinite reverse;
                }

                @keyframes banner-float {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(12deg);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .banner-swiper .swiper-pagination-bullet-active::after {
                        animation: none;
                        transform: scaleX(1);
                    }
                    .banner-float,
                    .banner-float-slow {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}

export default Banner;