"use client"
import { CiHeart } from "react-icons/ci";
import { usePost } from "@/utils/hooks/useReactQueryPublic";
import toast from "react-hot-toast";

export default function AddToFavoriteList({ productId }) {
    const { mutate } = usePost("/favorites", {
        onSuccess: () => {
            toast.success("Product added To wishList Successfully :");
        }
    });

    const addToFavoriteList = async () => {
        mutate({ productID: productId });
    };

    return (
        <div className="group/fav flex cursor-pointer items-center gap-1">
            <CiHeart />
            <p
                onClick={addToFavoriteList}
                className="ml-2 whitespace-nowrap rounded bg-sage-400 px-3 text-xs leading-[34px] text-white opacity-0 transition-opacity group-hover/fav:opacity-100"
            >
                Add to Favorite
            </p>
        </div>
    );
}
