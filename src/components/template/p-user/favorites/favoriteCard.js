"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuTrash2 } from "react-icons/lu";
import { useDelete } from "@/utils/hooks/useReactQuery";
import Stars from "@/components/modules/ui/stars";

export default function FavoriteCard({ id, name, score, price, img }) {
    const router = useRouter();

    const { mutate, isPending } = useDelete("/favorites", {
        onSuccess: () => {
            toast.success("Removed from favorites");
            router.refresh();
        },
    });

    const handleRemove = () =>
        swal({ title: "Remove from favorites?", icon: "warning", buttons: ["Cancel", "Remove"], dangerMode: true })
            .then((ok) => ok && mutate(id));

    return (
        <article className="card group flex flex-col overflow-hidden">
            <Link href={`/products/${id}`} className="relative block aspect-square overflow-hidden bg-gray-100 dark:bg-white/5">
                {img && (
                    <Image fill src={img} alt={name} sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
            </Link>
            <div className="flex flex-1 flex-col gap-2 p-4">
                <Link href={`/products/${id}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-sage-700 dark:text-gray-100">
                    {name}
                </Link>
                <Stars score={score} className="text-xs" />
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="font-semibold tabular-nums">{price} $</span>
                    <button type="button" onClick={handleRemove} disabled={isPending} className="btn btn-soft-danger btn-sm" title="Remove">
                        <LuTrash2 className="size-3.5" />
                        {isPending ? "Removing…" : "Remove"}
                    </button>
                </div>
            </div>
        </article>
    );
}
