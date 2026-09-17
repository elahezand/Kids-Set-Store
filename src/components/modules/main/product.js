"use client"
import Link from "next/link";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import AddToFavoriteList from "./addToFavoriteList";
import useShop from "@/utils/hooks/useShop";
import Image from "next/image";

const Card = ({ price, name, _id, score, img }) => {
  const { addTocard } = useShop();

  return (
    <div
      className="group relative flex h-full w-full flex-col rounded-2xl bg-white dark:bg-gray-800 p-2 text-text dark:text-gray-100 shadow-card transition-shadow duration-300 hover:shadow-float"
      data-aos="flip-left"
      data-aos-duration="1000"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
        <Image fill src={img} alt={name} className="object-cover transition-transform duration-300 group-hover:scale-105" />

        <div className="pointer-events-none absolute inset-0 z-[2] rounded-xl bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="invisible absolute left-0 top-2 z-[3] flex flex-col gap-2 text-lg text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 sm:text-xl md:text-2xl">
          <Link href={`/products/${_id}`} className="group/look flex items-center gap-1">
            <CiSearch className="cursor-pointer" />
            <p className="rounded-md bg-coral-300 px-3 text-[13px] leading-[34px] text-white opacity-0 transition-opacity group-hover/look:opacity-100">LoOK</p>
          </Link>
          <AddToFavoriteList productId={_id}>Add To Favorite</AddToFavoriteList>
        </div>

        <button
          onClick={() => addTocard(name, price, img, _id)}
          className="invisible absolute bottom-0 left-1/2 z-[3] w-max -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-md border border-white bg-transparent px-3 py-1 text-sm text-white opacity-0 transition-all duration-300 group-hover:visible group-hover:bottom-1/2 group-hover:opacity-100 hover:bg-coral-300"
        >
          Add To Card
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-center">
        <Link href={`/products/${_id}`} className="line-clamp-1 text-[13px] sm:text-sm">
          {name}
        </Link>
        {score && (
          <div className="flex items-center gap-0.5 text-sage-400">
            {new Array(score).fill(0).map((item, index) => (
              <FaStar key={index} />
            ))}
            {new Array(5 - score).fill(0).map((item, index) => (
              <FaRegStar key={index} />
            ))}
          </div>
        )}
        <span className="text-[13px] text-text dark:text-gray-100 sm:text-sm md:text-base">{price} $</span>
      </div>
    </div>
  );
};

export default Card;
