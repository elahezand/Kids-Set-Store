import styles from "@/components/modules/footer/footer.module.css";
import { FaRegHeart, FaFacebook, FaTwitter, FaGithub, FaInstagram, FaYoutube } from "react-icons/fa";
import Link from "next/link";
const Footer = () => {
    return (
        <footer className={styles.footer}>
            <main className={styles.container}>
                <section className={styles.descriptions}>
                    <p className={styles.descriptions_title}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </p>
                    <div className={styles.description}>
                        <FaRegHeart style={{ fontSize: "2rem" }} />
                        <p>
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Inventore, quos!
                        </p>
                    </div>
                    <div className={styles.description}>
                        <FaRegHeart />
                        <p>234567876543
                        </p>
                    </div>
                    <div className={styles.description}>
                        <FaRegHeart />
                        <p>support [at] set-kid.com</p>
                    </div>
                </section>

                <ul className={styles.links}>
                    <div>
                        <h4>Menu</h4>
                        <li>
                            <Link href={"/contact-us"}> Contact </Link>
                        </li>
                        <li>
                            <Link href={"/about-us"}> About Us </Link>
                        </li>
                        <li>
                            <Link href={"/rules"}>Rules</Link>
                        </li>
                    </div>
                    <div>
                        <h4> Ouick Access</h4>
                        <li>
                            <Link href={"/category"}> Store </Link>
                        </li>
                        <li>
                            <Link href={"/articles"}> Articles </Link>
                        </li>
                        <li>
                            <Link href={"/cart"}>Shopping Card</Link>
                        </li>
                        <li>
                            <Link href={"/wishlist"}>  Favorites</Link>
                        </li>
                    </div>
                </ul>

                <div className={styles.social_media}>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltip_text}>Facebook</div>
                        <span>
                            <FaFacebook />
                        </span>
                    </div>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltip_text}>Twitter</div>
                        <span>
                            <FaTwitter />
                        </span>
                    </div>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltip_text}>Instagram</div>
                        <span>
                            <FaInstagram />
                        </span>
                    </div>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltip_text}>GitHuB</div>
                        <span>
                            <FaGithub />
                        </span>
                    </div>
                    <div className={styles.tooltip}>
                        <div className={styles.tooltip_text}>Youtube</div>
                        <span>
                            <FaYoutube />
                        </span>
                    </div>
                </div>

            </main>
            <hr />
        </footer>
    );
};

export default Footer;
