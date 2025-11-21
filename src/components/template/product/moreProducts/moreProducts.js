"use client";
import Product from "../../../modules/product/product"
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const MoreProducts = ({ related }) => {
  return (
    <div data-aos="fade-right">
      <section>
        <h2> Related Product</h2>
        <div
          style={{
            height: "2px",
            width: "70px",
            background: "black",
            marginTop: "10px",
          }}
        ></div>
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
