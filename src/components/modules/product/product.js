"use client"
import Link from "next/link";
import styles from "./product.module.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import AddToFavoriteList from "../addToFavoriteList/addToFavoriteList";
import useShop from "@/hooks/useShop";
import Image from "next/image";

const Card = ({ price, name, _id, score, img }) => {
  const { addTocard } = useShop()

  return (
    <div className={styles.card}
      data-aos="flip-left"
      data-aos-duration="1000"
    >
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
            <p className={styles.tooltip}>LoOK</p>
          </Link>
          <AddToFavoriteList
            className={styles.favorite}
            productid={_id}
          >  Add To Favriote
          </AddToFavoriteList>
        </div>
        <button
          onClick={() => addTocard(name, price, img, _id)}>
          Add To Card</button>
      </div>
      <div className={styles.details}>
        <Link href={`/product/${_id}`}>
          {name}
        </Link>
        {score &&
          <div>
            {new Array(score).fill(0).map((item, index) => (
              <FaStar key={index} />
            ))}
            {new Array(5 - score).fill(0).map((item, index) => (
              <FaRegStar key={index} />
            ))}
          </div>
        }
        <span>{price} $</span>
      </div>
    </div>
  );
};

export default Card;
