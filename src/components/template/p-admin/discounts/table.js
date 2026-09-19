"use client";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuBadgePercent, LuTrash2 } from "react-icons/lu";
import { useDelete } from "@/utils/hooks/useReactQuery";
import EmptyState from "@/components/modules/ui/emptyState";

export default function DiscountsTable({ discounts = [], total }) {
    const router = useRouter();

    const { mutate: removeDiscount } = useDelete("/discount", {
        onSuccess: () => {
            toast.success("Code removed successfully");
            router.refresh();
        },
    });

    const confirmRemove = (id) =>
        swal({ title: "Remove this discount?", icon: "warning", buttons: ["Cancel", "Remove"], dangerMode: true })
            .then((ok) => ok && removeDiscount(id));

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Discount codes</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} codes</span>}
            </div>

            {discounts.length === 0 ? (
                <EmptyState title="No discount codes yet" icon={LuBadgePercent} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Percent</th>
                                <th>Usage</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount) => {
                                const usedUp = discount.uses >= discount.max;
                                const usage = discount.max ? Math.min(100, Math.round((discount.uses / discount.max) * 100)) : 0;
                                return (
                                    <tr key={discount._id}>
                                        <td>
                                            <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-gray-900 dark:bg-white/5 dark:text-gray-100">
                                                {discount.code}
                                            </code>
                                        </td>
                                        <td className="font-medium tabular-nums">{discount.percent}%</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                                                    <div className={`h-full rounded-full ${usedUp ? "bg-gray-600" : "bg-sage-500"}`} style={{ width: `${usage}%` }} />
                                                </div>
                                                <span className="text-xs tabular-nums">{discount.uses || 0}/{discount.max}</span>
                                            </div>
                                        </td>
                                        <td className="tabular-nums">{discount.createdAt?.slice(0, 10)}</td>
                                        <td>
                                            <span className={`badge ${usedUp ? "badge-neutral" : "badge-success"}`}>
                                                {usedUp ? "Used up" : "Active"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex justify-end">
                                                <button type="button" onClick={() => confirmRemove(discount._id)} className="btn btn-soft-danger btn-sm">
                                                    <LuTrash2 className="size-3.5" /> Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
