"use client";
import swal from "sweetalert";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import EmptyState from "@/components/modules/ui/emptyState";
import Stars from "@/components/modules/ui/stars";

export default function CommentsTable({ comments = [] }) {
    const showBody = (body) => swal({ title: "Your comment", text: body, buttons: "Close" });

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">My comments</h2>
            </div>
            {comments.length === 0 ? (
                <EmptyState title="No comments yet" description="Reviews you write on products will show up here." icon={LuMessageSquare} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Date</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th className="text-right">Content</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment) => (
                                <tr key={comment._id}>
                                    <td className="max-w-[240px] truncate font-medium text-gray-900 dark:text-gray-100">{comment.productID?.name || "—"}</td>
                                    <td className="tabular-nums">{comment.date?.slice(0, 10)}</td>
                                    <td><Stars score={comment.score} className="text-xs" /></td>
                                    <td>
                                        <span className={`badge ${comment.isAccept ? "badge-success" : "badge-warning"}`}>
                                            {comment.isAccept ? "Approved" : "Pending"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => showBody(comment.body)} className="btn btn-secondary btn-sm">
                                                <LuEye className="size-3.5" /> View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
