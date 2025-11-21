"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";


// import required modules
import { Autoplay, EffectFade } from "swiper/modules";

function Banner() {
  return (
    <div className="slider">
      <Swiper
        rewind={true}
        loop={true}
        effect="fade"
        speed={800}
        autoplay={{ delay: 2000 }}
        modules={[Autoplay, EffectFade]}
        className="mySwiper home-slider"
      >
        <SwiperSlide>
          <Image
            width={400}
            height={400}
            src="/images/9TLEldnt_o.jpg"
            alt="Slide"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            width={400}
            height={400}
            src="/images/l3OkYWbj_o.jpg"
            alt="Slide"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            width={400}
            height={400}
            src="/images/NvEJFjye_o.jpg"
            alt="Slide"
            fetchPriority="high"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            width={400}
            height={400}
            src="/images/PGQGfZ5Y_o.jpg"
            alt="Slide"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </SwiperSlide>
        <SwiperSlide>
          <Image
            width={400}
            height={400}
            src="/images/sq6nenaI_o.jpg"
            alt="Slide"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </SwiperSlide>
      </Swiper>
    </div>

  );
}

export default Banner;
