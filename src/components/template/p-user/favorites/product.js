"use client"
import Link from "next/link";
import styles from "./product.module.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { manageError } from "@/utils/helper";

const Card = ({ price, name, score, id, img }) => {
    const router = useRouter()
    const removeFromWishList = async () => {
        swal({
            title: "Are You Sure To Remove This Item ?",
            icon: "success",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/favorites/${id}`, {
                        method: "DELETE"
                    })
                    if (res.status !== 200) return manageError(res.status)
                    swal({
                        title: "Item Remove Successfully :)",
                        icon: "success",
                        buttons: "ok"
                    }).then(result => {
                        if (result) {
                            router.refresh()
                        }
                    })

                }
                catch (err) {
                    swal({
                        title: "NetWork Error",
                        icon: "warning",
                        buttons: "ok"
                    })
                }
            }
        })
    }

    return (
        <div className={styles.card}>
            <div className={styles.details_container}>
                <Image
                    height={200}
                    width={200}
                    src={img}
                    alt=""
                />
                <div className={styles.icons}>
                    <Link href="/">
                        <CiSearch />
                        <p
                            className={styles.tooltip}>LoOK</p>
                    </Link>
                </div>
                <button> Add To Card</button>
            </div>

            <div className={styles.details}>
                <Link href={"/"}>
                    {name}
                </Link>
                <div>
                    {new Array(score).fill(0).map((item, index) => (
                        <FaStar key={index} />
                    ))}
                    {new Array(5 - score).fill(0).map((item, index) => (
                        <FaRegStar key={index} />
                    ))}
                </div>
                <span>{price} $</span>
            </div>
            <button
                onClick={removeFromWishList}
                className={styles.remove}>
                Remove Item</button>
        </div>
    );
};

export default Card;
