"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

const PLACEHOLDER = "/placeholder.png";

interface GalleryProps {
    images?: string[];
    title?: string;
}

const Gallery = ({ images = [], title = "Product image" }: GalleryProps) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperInstance | null>(null);

    const filtered = images.filter(Boolean);
    const list = filtered.length ? filtered : [PLACEHOLDER];

    return (
        <section className="w-full md:w-[36%]">
            <Swiper
                spaceBetween={10}
                modules={[FreeMode, Thumbs]}
                thumbs={{
                    swiper:
                        thumbsSwiper && !thumbsSwiper.destroyed
                            ? thumbsSwiper
                            : null,
                }}
                className="mySwiper2 !h-[280px] w-full sm:!h-[360px] md:!h-[420px]"
            >
                {list.map((src, index) => (
                    <SwiperSlide key={`${src}-${index}`} className="relative">
                        <Image
                            src={src}
                            alt={`${title} - ${index + 1}`}
                            fill
                            priority={index === 0}
                            sizes="(max-width: 768px) 100vw, 36vw"
                            className="object-contain"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {list.length > 1 && (
                <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView={4}
                    freeMode
                    watchSlidesProgress
                    modules={[FreeMode, Thumbs]}
                    className="gallery-slider-2 mt-2 !h-[70px] w-full sm:!h-[90px]
                        [&_.swiper-slide]:cursor-pointer [&_.swiper-slide]:opacity-50
                        [&_.swiper-slide-thumb-active]:opacity-100"
                >
                    {list.map((src, index) => (
                        <SwiperSlide
                            key={`thumb-${src}-${index}`}
                            className="relative"
                        >
                            <Image
                                src={src}
                                alt=""
                                fill
                                sizes="100px"
                                className="object-contain"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};

export default Gallery;