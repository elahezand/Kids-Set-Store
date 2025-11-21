import Link from "next/link";
import styles from "@/components/template/index/promote/promote.module.css";
import Image from "next/image";

const Promote = () => {
    return (
        <div className="container">
            <div className={styles.main}>
                <div className={styles.club_container}
                    data-aos="fade-up-right">
                    <div className={styles.img_container}>
                        <Image
                            width={400}
                            height={400}
                            data-aos="fade-left"
                            src="/images/18a283436b78bc41b0c0f819d8d07f6c.jpg" alt="" />
                    </div>
                    <div className={styles.club}>
                        <div>
                            <span>Set Kids Club</span>
                            <p> Royal Customers Of Set Kids</p>
                        </div>
                    </div>
                </div>
                <div
                    data-aos="fade-up-left"
                    className={styles.kid_container}>
                    <div className={styles.why_kid}>
                        <p className={styles.title}>Why Set Kids ?</p>
                        <p>
                            With years of experience and feedback from parents Set kids offer a wide range of stylish and comfortable childrens clothing
                            .our mission is to make shopping easier for families by provoding trendy,high quality outfits at affordable prices
                        </p>

                        <div>
                            <Link href="/about-us">
                                <button className={styles.red_btn}>
                                    About US
                                </button>
                            </Link>
                            <Link href="/category">
                                <button>Store</button>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.img_container}>
                        <Image
                            width={400}
                            height={400} src="/images/sxqTX7BJ_o.jpg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Promote;
