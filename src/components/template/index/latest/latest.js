import Link from "next/link";
import styles from "./latest.module.css";
import Product from "@/components/modules/product/product"
import { FaChevronRight } from "react-icons/fa";
const Latest = ({ products }) => {
    return (
        <div className="container">
            <section className="section-heading">
                <Link className="section-heading_link" href={"/products"}>
                    <FaChevronRight />{" "}
                    See More
                </Link>
                <div>
                    <span>Our products</span>
                </div>
            </section>
            <div className={styles.products}
                data-aos="fade-up" >
                {products.length ? products.map((item, index) => (
                    <Product
                        {...item}
                        key={index + 1} />
                )) : null}
            </div>
        </div>
    );
};

export default Latest;
