import { MdOutlineSms } from "react-icons/md";
import styles from "@/components/template/index/articles/article.module.css";
import { IoShareSocialOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import {
    FaFacebookF,
    FaLinkedinIn,
    FaPinterest,
    FaTelegram,
    FaTwitter,
} from "react-icons/fa";

const Article = ({ _id, author, title, createdAt, cover }) => {
    return (
        <div
            data-aos="zoom-in"
            data-aos-duration="1000"
            className={styles.card}>
            <Link className={styles.img_container}
                href={`/atricles/${_id}`}>
                <Image
                    height={200}
                    width={200}
                    src={cover}
                    alt=""
                />
            </Link>
            <div className={styles.date}>
                <span>{createdAt.slice(0, 10)}</span>
            </div>
            <div className={styles.details}>
                <Link
                    href={`/atricles/${_id}`}
                    className={styles.tag}>
                    {title}
                </Link>
                <div>
                    <p>Author</p>
                    <Image
                        width={200}
                        height={200}
                        src="/images/user-profile-flat-illustration-avatar-person-icon-gender-neutral-silhouette-profile-picture-free-vector.jpg"
                        alt=""
                    />
                    <p>{author}</p>
                    <div>
                        <MdOutlineSms />
                        <span>0</span>
                    </div>
                    <div className={styles.share}>
                        <IoShareSocialOutline />
                        <div className={styles.tooltip}>
                            <Link href={"/"}>
                                <FaTelegram />
                            </Link>
                            <Link href={"/"}>
                                <FaLinkedinIn />
                            </Link>
                            <Link href={"/"}>
                                <FaPinterest />
                            </Link>
                            <Link href={"/"}>
                                <FaTwitter />
                            </Link>
                            <Link href={"/"}>
                                <FaFacebookF />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Article;
