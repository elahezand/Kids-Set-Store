"use client"
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";
import { Autoplay } from "swiper/modules";
import Article from "./article";

const Articles = ({ articles }) => {
    return (
        <div className="container">
            <section className="section-heading">
                <Link className="section-heading_link" href={"/articles"}>
                    <FaChevronRight />{" "}
                    See More
                </Link>
                <div>
                    <span>Our Articles</span>
                </div>
            </section>            <main>
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
