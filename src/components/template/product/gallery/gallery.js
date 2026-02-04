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
    return (
        <section style={{ width: "36%", height: "100%" }}>
            <Swiper
                spaceBetween={10}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Thumbs]}
             className="mySwiper2 gallery-slider"
            >
                {Array.isArray(images) ? images.map((img, index) => (
                    <>
                        <SwiperSlide key={index}>
                            <Image
                                alt=""
                                height={600}
                                width={600}
                                src={img} />
                        </SwiperSlide>
                    </>
                )) :
                    <SwiperSlide>
                        <Image
                            alt=""
                            height={600}
                            width={600}
                            src={images} />
                    </SwiperSlide>
                }
            </Swiper>
            <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
             className="gallery-slider-2"
            >
                {Array.isArray(images) ? images.map((img) => (
                    <SwiperSlide key={Math.random()}>
                        <Image
                            alt=""
                            height={600}
                            width={600}
                            src={img} />
                    </SwiperSlide>
                )) :
                    <SwiperSlide key={Math.random()}>
                        <Image
                            alt=""
                            height={600}
                            width={600}
                            src={images} />
                    </SwiperSlide>

                }
            </Swiper>
        </section>
    );
};

export default Gallery;
