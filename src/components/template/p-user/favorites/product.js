"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDelete } from "@/utils/hooks/useReactQueryPanel";
import styles from "./product.module.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import Image from "next/image";

const Card = ({ price, name, score, id, img }) => {
    const router = useRouter()
    const { mutate,isLoading } = useDelete(`/favorites`, {
        onSuccess: (data) => {
            toast.success("Item Removed Successfully :)")
            router.refresh()
        },
    })

    const handleRemove = () => {
        swal({
            title: "Are You Sure To remove This item?",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(result => {
            if (result) {
                mutate(id)
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
            <button onClick={handleRemove} className={styles.remove} disabled={isLoading}>
                {isLoading ? "Removing..." : "Remove Item"}
            </button>
        </div>
    );
};

export default Card;
