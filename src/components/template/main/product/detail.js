import { FaFacebookF, FaStar, FaTwitter, FaTelegram, FaLinkedinIn, FaPinterest } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { TbSwitch3 } from "react-icons/tb";
import { FaRegStar } from "react-icons/fa6";
import Link from "next/link";
import AddToBasket from "@/components/modules/main/addToBasket";
import AddToFavoriteList from "@/components/modules/main/addToFavoriteList";

const Details = ({ product, productComments }) => {
    return (
        <main className="w-full md:w-[63%]">
            <h2 className="text-xl sm:text-2xl">{product.name}</h2>
            <div className="mt-8 flex gap-1">
                <p>Comments ({productComments})</p>
                {[...Array(5)].map((_, index) => (
                    index < product.score
                        ? <FaStar key={index} className="text-xl text-coral-300" />
                        : <FaRegStar key={index} className="text-xl text-coral-300" />
                ))}
            </div>
            <p className="my-6 font-shabnam-bold text-2xl text-sage-400">{product.price} $</p>
            <span className="block w-full text-[15px] text-[rgb(160,151,151)] sm:w-[93%]">
                {product.shortDescription}
            </span>
            <hr className="my-5" />
            <div className="mb-12 flex items-center gap-1.5">
                <IoCheckmark className="text-2xl" />
                <p>Available</p>
            </div>
            <AddToBasket
                name={product.name}
                price={product.price}
                img={product.img}
                id={product._id}
            />
            <section className="mb-8 mt-6 flex flex-wrap gap-5">
                <AddToFavoriteList productId={product._id} />
                <div className="flex items-center gap-1">
                    <TbSwitch3 className="text-xl text-sage-400" />
                    <Link href="/" className="text-sm transition-all hover:cursor-pointer hover:text-gray-700">Compare</Link>
                </div>
            </section>

            <hr className="my-5" />
            <div className="mt-8 flex flex-col gap-4">
                <strong>Product ID: {product._id}</strong>
                <p><strong>TAGS:</strong> {product.tags.join(",")}</p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sage-400">
                <p className="text-text dark:text-gray-100">Share:</p>
                <Link href="/"><FaTelegram className="text-lg" /></Link>
                <Link href="/"><FaLinkedinIn className="text-lg" /></Link>
                <Link href="/"><FaPinterest className="text-lg" /></Link>
                <Link href="/"><FaTwitter className="text-lg" /></Link>
                <Link href="/"><FaFacebookF className="text-lg" /></Link>
            </div>
            <hr className="my-5" />
        </main>
    );
};

export default Details;
