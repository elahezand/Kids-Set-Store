"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuNewspaper, LuPencil, LuTrash2 } from "react-icons/lu";
import { useDelete } from "@/utils/hooks/useReactQuery";
import EmptyState from "@/components/modules/ui/emptyState";

export default function ArticlesTable({ data = [], total }) {
    const router = useRouter();

    const { mutate } = useDelete("/article", {
        onSuccess: () => {
            toast.success("Article removed successfully");
            router.refresh();
        },
    });

    const removeArticle = (id) =>
        swal({ title: "Remove this article?", icon: "warning", buttons: ["Cancel", "Remove"], dangerMode: true })
            .then((ok) => ok && mutate(id));

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Articles list</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} articles</span>}
            </div>

            {data.length === 0 ? (
                <EmptyState title="No articles yet" icon={LuNewspaper} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Author</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((article) => {
                                const published = article.status === "published";
                                return (
                                    <tr key={article._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {article.cover && (
                                                    <Image width={56} height={40} src={article.cover} alt=""
                                                        className="h-10 w-14 rounded-md border border-gray-200 object-cover dark:border-white/10" />
                                                )}
                                                <div className="max-w-[280px] leading-tight">
                                                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">{article.title}</p>
                                                    <p className="truncate text-xs text-gray-700 dark:text-gray-500">{article.shortDescription}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{article.author}</td>
                                        <td className="tabular-nums">{article.createdAt?.slice(0, 10)}</td>
                                        <td>
                                            <span className={`badge ${published ? "badge-success" : "badge-warning"} capitalize`}>{article.status || "draft"}</span>
                                        </td>
                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={published ? `/p-admin/articles/${article._id}` : `/p-admin/articles/draft?id=${article._id}`}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    <LuPencil className="size-3.5" /> {published ? "Edit" : "Continue draft"}
                                                </Link>
                                                <button type="button" onClick={() => removeArticle(article._id)} className="btn btn-soft-danger btn-sm">
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
