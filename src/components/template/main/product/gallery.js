"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { useState } from "react";

const Gallery = ({ images, title }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const list = Array.isArray(images)
    ? images.filter(Boolean)
    : images
      ? [images]
      : [];

  if (!list.length) return null;

  return (
    <section className="w-full md:w-[36%]">
      <Swiper
        spaceBetween={10}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Thumbs]}
        className="mySwiper2 !h-[280px] w-full sm:!h-[360px] md:!h-[420px]"
      >
        {list.map((img, index) => (
          <SwiperSlide key={img || index} className="relative">
            <Image
              src={img}
              alt={title || "Product image"}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 36vw"
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
          modules={[FreeMode, Navigation, Thumbs]}
          className="gallery-slider-2 !h-[70px] w-full sm:!h-[90px]"
        >
          {list.map((img, index) => (
            <SwiperSlide key={img || index} className="relative">
              <Image
                src={img}
                alt={title || "Product image"}
                fill
                className="object-contain"
                sizes="100px"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default Gallery;