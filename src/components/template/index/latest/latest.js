import Link from "next/link";
import styles from "./latest.module.css";
import Product from "@/components/modules/product/product"
import { FaChevronRight } from "react-icons/fa";
const Latest = ({ products }) => {
    return (
        <div className="container">
            <section className={styles.title}>
                <Link className={styles.link} href={"products?value=latest&page=1"}>
                    <FaChevronRight />{" "}
                    See More
                </Link>
                <div>
                    <span>Latest products</span>
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
