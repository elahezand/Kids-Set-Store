"use client"
import React,{useState} from 'react'
import Product from "@/components/modules/product/product";
import { useGet } from '@/utils/hooks/useReactQueryPublic';
import styles from "@/styles/wishList.module.css";
import Link from "next/link";
import { FaRegHeart } from "react-icons/fa";
export default function WishListItems({ data: initialData, limit, nextCursor }) {

    const [favorites, setFavorites] = useState(initialData);
    const [cursor, setCursor] = useState(nextCursor);
    const [loading, setLoading] = useState(false);

    const { refetch } = useGet(
        "/favorites",
        { cursor, limit },
        { enabled: false }
    );

    const loadMore = async () => {
        if (!cursor || loading) return;

        setLoading(true);
        const res = await refetch();

        setFavorites(prev => [...prev, ...res.data.data]);
        setCursor(res.data.nextCursor);
        setLoading(false);
    };
    

    return (
        <>
            <main className={styles.container} data-aos="fade-up">
                {favorites.map((wish, index) =>
                        <Product
                            key={index}
                            {...wish} />)}
                {cursor && (
                    <div className="mt-5 col-12">
                        <button onClick={loadMore} className="classic w-100"
                            disabled={loading}>
                            {loading ? "Loading..." : "Load more"}
                        </button>
                    </div>
                )}
            </main>
            {favorites.length === 0 && (
                <div className={styles.wishlist_empty} data-aos="fade-up">
                    <FaRegHeart />
                    <p> No Product Found</p>
                    <span>You Do NOT Have Any Products In Your Favorites List Yet :(</span>
                    <span>You Will Find Lots Of Interstingg Products On The Home Page</span>
                    <div>
                        <Link href="/products">Back TO Shop</Link>
                    </div>
                </div>
            )}

        </>
    )
}
