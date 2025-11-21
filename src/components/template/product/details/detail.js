import { FaFacebookF, FaStar, FaTwitter } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import styles from "./detail.module.css"
import { TbSwitch3 } from "react-icons/tb";
import { FaTelegram, FaLinkedinIn, FaPinterest } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa6";
import Link from "next/link";
import AddToBasket from "@/components/modules/addToBasket/addToBasket";
import AddToFavoriteList from "@/components/modules/addToFavoriteList/addToFavoriteList";
const Details = ({ product }) => {
    return (
        <main style={{ width: "63%" }}>
            <h2>
                {product.name}
            </h2>

            <div className={styles.rating}>
                <p>Comments ({product.comments.length})</p>
                {new Array(product.score).fill(0).map((item, index) => (
                    <FaStar key={index} />
                ))}
                {new Array(5 - product.score).fill(0).map((item, index) => (
                    <FaRegStar key={index} />
                ))}
            </div>
            <p className={styles.price}>{product.price} $</p>
            <span className={styles.description}>
                {product.shortDescription}
            </span>
            <hr />
            <div className={styles.Available}>
                <IoCheckmark />
                <p> Available</p>
            </div>
            <AddToBasket
                product={product} />
            <section className={styles.wishlist}>
                <AddToFavoriteList
                    productid={JSON.parse(JSON.stringify(product._id))}
                />
                <div>
                    <TbSwitch3 />
                    <Link href="/">Compare</Link>
                </div>
            </section>

            <hr />
            <div className={styles.details}>
                <strong> Product ID:{product._id}</strong>
                <p>
                    <strong>TAGS:</strong> {product.tags.join(",")}
                </p>
            </div>
            <div className={styles.share}>
                <p>Share: </p>
                <Link href="/">
                    <FaTelegram />
                </Link>
                <Link href="/">
                    <FaLinkedinIn />
                </Link>
                <Link href="/">
                    <FaPinterest />
                </Link>
                <Link href="/">
                    <FaTwitter />
                </Link>
                <Link href="/">
                    <FaFacebookF />
                </Link>
            </div>
            <hr />
        </main>
    );
};

export default Details;
