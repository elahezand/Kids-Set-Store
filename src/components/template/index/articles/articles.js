"use client"
import styles from "@/components/template/index/articles/articles.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import Article from "./article";

const Articles = ({ articles }) => {
    return (
        <div className="container">
            <p className={styles.title}>Our Articles</p>
            <main>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={10}
                    breakpoints={
                        {
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20

                            },
                            1200: {
                                slidesPerView: 3,
                                spaceBetween: 30

                            },
                        }
                    }
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    rewind={true}
                    loop={true}
                    modules={[Autoplay]}
                    className="mySwiper articles_slider">
                    {articles.length ? articles.map((item, index) => (
                        <SwiperSlide key={index + 1}>
                            <Article {...item} />
                        </SwiperSlide>
                    )) : null}
                </Swiper>
            </main>
        </div>
    );
};

export default Articles;
