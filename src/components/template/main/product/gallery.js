"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { useState } from "react";

const Gallery = ({ images }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const list = Array.isArray(images) ? images : [images];

    return (
        <section className="w-full md:w-[36%]">
            <Swiper
                spaceBetween={10}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Thumbs]}
                className="mySwiper2 !h-[280px] w-full sm:!h-[360px] md:!h-[420px]"
            >
                {list.map((img, index) => (
                    <SwiperSlide key={index} className="relative">
                        <Image alt="" fill className="object-contain" src={img} />
                    </SwiperSlide>
                ))}
            </Swiper>
            <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="gallery-slider-2 !h-[70px] w-full sm:!h-[90px]"
            >
                {list.map((img, index) => (
                    <SwiperSlide key={index} className="relative">
                        <Image alt="" fill className="object-contain" src={img} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Gallery;
