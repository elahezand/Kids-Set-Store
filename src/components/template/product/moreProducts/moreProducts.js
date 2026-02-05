"use client";
import Product from "../../../modules/product/product"
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronRight } from "react-icons/fa";
import "swiper/css";
import Link from "next/link";
import "swiper/css/navigation";

const MoreProducts = ({ related }) => {
  return (
    <div data-aos="fade-right">
      <section className="section-heading">
        <Link className="section-heading_link" href={"/products"}>
          <FaChevronRight />{" "}
          See More
        </Link>
        <div>
          <span> Related Product</span>
        </div>
      </section>
      <Swiper
        slidesPerView={4}
        spaceBetween={30}
        rewind={true}
        className="mySwiper "
      >
        {related?.map((item, index) => (
          <SwiperSlide key={index}>
            <Product
              {...item}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MoreProducts;
