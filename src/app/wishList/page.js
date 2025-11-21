import Navbar from "@/components/modules/navbar/navbar";
import Footer from "@/components/modules/footer/footer";
import Breadcrumb from "@/components/modules/breadCrumb/breadCrumb";
import Product from "@/components/modules/product/product";
import styles from "@/styles/wishList.module.css";
import { getMe } from "@/utils/serverHelper";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
import FavoriteModel from "../../../model/favorite";

const page = async () => {
    const user = await getMe()
    let favorites = []

    if (user) {
        favorites = await FavoriteModel.find({ userID: user._id })
            .populate("productID", "name price score img")
            .lean();
    }

    return (
        <>
            <Navbar />
            <Breadcrumb route={"Favorites"} title={"Favorites List"} />
            <main className={styles.container} data-aos="fade-up">
                <section>
                    {favorites.length > 0 &&
                        JSON.parse(JSON.stringify(favorites)).map((wish, index) =>
                            <Product
                                key={index}
                                userID={wish.userID}
                                {...wish.productID} />)}
                </section>
            </main>
            {favorites.length === 0 && (
                <div className={styles.wishlist_empty} data-aos="fade-up">
                    <FaRegHeart />
                    <p> No Product Found</p>
                    <span>You Do NOT Have Any Products In Your Favorites List Yet :(</span>
                    <span>You Will Find Lots Of Interstingg Products On The Home Page</span>
                    <div>
                        <Link href="/category">Back TO Shop</Link>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default page;
