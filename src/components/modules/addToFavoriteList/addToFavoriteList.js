"use client"
import { CiHeart } from "react-icons/ci";
import { usePost } from "@/utils/hooks/useReactQueryPublic";
import styles from "./addToFavorites.module.css"
import toast from "react-hot-toast";

export default function AddToFavoriteList({ productId }) {
    const { mutate } = usePost("/favorites", {
        onSuccess: (data) => {
            toast.success("Product added To wishList Successfully :");
        }
    })

    const addToFavoriteList = async () => {
        const newItem = {
            productID: productId
        }
        mutate(newItem)
    }
    return (
        <div className={styles.favorites}>
            <CiHeart />
            <p
                onClick={addToFavoriteList}
                className={styles.tooltip}>
                Add to Favriote</p>
        </div>
    )
}
