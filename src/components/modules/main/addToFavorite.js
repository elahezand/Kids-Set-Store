"use client"
import { CiHeart } from "react-icons/ci";
import { usePost } from "@/utils/hooks/useReactQuery";
import { toast } from "sonner";
export default function AddToFavoriteList({ productId }) {
    const { mutate } = usePost("/user/favorites", {
        onSuccess: () => {
            toast.success("Product added To favorite Successfully :");
        }
    });

    const addToFavoriteList = async () => {
        mutate({ productId });
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
