"use client"
import Link from "next/link";
import styles from "@/components/template/index/latest/latest.module.css";
import Product from "@/components/modules/product/product"
import { FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

export default function BestSelling({ products }) {
    return (
        <div className="container">
            <section className={styles.title}>
                <Link className={styles.link} href={"products?value=bestSelling&page=1"}>
                    <FaChevronRight />{" "}
                    See More
                </Link>
                <div>
                    <span>Best products</span>
                </div>
            </section>

            <Swiper
                slidesPerView={1}
                spaceBetween={10}
                breakpoints={
                    {
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 20

                        },
                        1200: {
                            slidesPerView: 5,
                            spaceBetween: 30

                        },
                    }
                }
                autoplay={{ delay: 1500, disableOnInteraction: false }}
                rewind={true}
                loop={true}
                modules={[Autoplay]}>
                {products.length ?
                    products.map((item, index) => (
                        <SwiperSlide key={index + 1}>
                            <Product
                                {...item}
                                key={index + 1} />
                        </SwiperSlide>

                    )) : null}

            </Swiper>
        </div>
    )
}

