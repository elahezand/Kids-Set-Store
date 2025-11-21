import Link from "next/link";
import styles from "./order.module.css";
import Image from "next/image";

const Order = () => {
    return (
        <Link href={`/product/123`}className={styles.card}>
            <div>
                <div>
                    <p>  Lorem ipsum dolor sit amet.</p>
                    <Image
                        width={200}
                        height={200}
                        src="https://set-coffee.com/wp-content/uploads/2022/03/ethiopia-430x430.png"
                        alt=""
                    />
                </div>
                <p> Completed</p>
            </div>
            <div>
                <p>8:00 2025/10/21</p>
                <p className={styles.price}>200000 $ </p>
            </div>
        </Link>
    );
};

export default Order;
