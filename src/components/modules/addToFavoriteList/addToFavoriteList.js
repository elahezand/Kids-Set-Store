"use client"
import { CiHeart } from "react-icons/ci";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import styles from "./addToFavorites.module.css"

export default function AddToFavoriteList({ productId }) {
    const router = useRouter()
    const authUser = async () => {
        const res = await fetch("/api/auth/me")
        if (res.status === 200) {
            const user = await res.json()
            return user
        }
    }

    const addToFavorite = async () => {
        const user = await authUser()
        if (user) {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userID: user.user._id,
                    productID: productId
                })

            })
            if (res.status === 200) {
                swal({
                    title: "This Item Added To Your Favorite List",
                    icon: "success",
                    buttons: "ok"
                }).then(result => {
                    if (result) {
                        router.refresh()
                    }
                })
            }

        } else {
            swal({
                title: "Please LogIN",
                icon: "warnings",
                buttons: "Go To Dashboard"
            }).then(result => {
                if (result) {
                    router.push("/login-register")
                }
            })
        }
    }
    return (
        <div className={styles.favorites}>
            <CiHeart />
            <p onClick={addToFavorite}
                className={styles.tooltip}>
                Add to Favriote</p>
        </div>
    )
}
