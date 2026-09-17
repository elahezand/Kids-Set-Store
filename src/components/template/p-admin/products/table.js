"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuPackage, LuPencil, LuTrash2 } from "react-icons/lu";
import { useDelete } from "@/utils/hooks/useReactQueryPanel";
import EmptyState from "@/components/modules/ui/emptyState";
import Stars from "@/components/modules/ui/stars";
import EditProductModal from "./editProductModal";

export default function ProductsTable({ products = [], total }) {
    const router = useRouter();
    const [editing, setEditing] = useState(null);

    const { mutate } = useDelete("/products", {
        onSuccess: () => {
            toast.success("Product removed successfully");
            router.refresh();
        },
    });

    const removeProduct = (id) => {
        swal({ title: "Remove this product?", icon: "warning", buttons: ["Cancel", "Remove"], dangerMode: true })
            .then((ok) => ok && mutate(id));
    };

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Products list</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} items</span>}
            </div>

            {products.length === 0 ? (
                <EmptyState title="No products yet" description="Products you add will show up here." icon={LuPackage} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Score</th>
                                <th>Material</th>
                                <th>Color</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            {product.img && (
                                                <Image width={44} height={44} src={product.img} alt=""
                                                    className="size-11 rounded-lg border border-gray-200 object-cover dark:border-white/10" />
                                            )}
                                            <span className="max-w-[220px] truncate font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="tabular-nums">{product.price} $</td>
                                    <td><Stars score={product.score} className="text-xs" /></td>
                                    <td>{product.material || "—"}</td>
                                    <td>{product.color || "—"}</td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setEditing(product)} className="btn btn-secondary btn-sm">
                                                <LuPencil className="size-3.5" /> Edit
                                            </button>
                                            <button type="button" onClick={() => removeProduct(product._id)} className="btn btn-soft-danger btn-sm">
                                                <LuTrash2 className="size-3.5" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && <EditProductModal data={editing} hideModal={() => setEditing(null)} />}
        </section>
    );
}
