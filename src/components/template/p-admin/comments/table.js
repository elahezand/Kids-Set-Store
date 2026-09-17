"use client";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuBan, LuCheck, LuEye, LuMessageSquare, LuPencil, LuReply, LuX } from "react-icons/lu";
import { usePost, usePut } from "@/utils/hooks/useReactQueryPanel";
import EmptyState from "@/components/modules/ui/emptyState";
import Stars from "@/components/modules/ui/stars";

export default function CommentsTable({ comments = [], total }) {
    const router = useRouter();

    const done = (message) => () => {
        toast.success(message);
        router.refresh();
    };

    const { mutate: answerMutate } = usePost("/comments/answer", { onSuccess: done("Your answer was sent") });
    const { mutate: acceptMutate } = usePut("/comments", { onSuccess: done("Comment status updated") });
    const { mutate: editMutate } = usePut("/comments", { onSuccess: done("Comment updated") });
    const { mutate: banMutate } = usePost("/users/ban", { onSuccess: done("User banned successfully") });

    const showContent = (content) => swal({ title: "Comment", text: content, buttons: "Close" });

    const answerComment = (commentID) =>
        swal({ title: "Write your answer", content: "input", buttons: ["Cancel", "Send"] })
            .then((answer) => answer && answerMutate({ answer, commentID }));

    const editComment = (id, content) =>
        swal({ title: "Edit comment", text: `Current: ${content}`, content: "input", buttons: ["Cancel", "Save"] })
            .then((body) => body && editMutate({ id, payload: { body } }));

    const banUser = (email, username) =>
        swal({ title: "Ban this user?", icon: "warning", buttons: ["Cancel", "Ban"], dangerMode: true })
            .then((ok) => ok && banMutate({ email, username }));

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Comments list</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} comments</span>}
            </div>

            {comments.length === 0 ? (
                <EmptyState title="No comments yet" icon={LuMessageSquare} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Product</th>
                                <th>Score</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment) => (
                                <tr key={comment._id}>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{comment.username}</p>
                                        <p className="text-xs text-gray-700 dark:text-gray-500">{comment.email}</p>
                                    </td>
                                    <td className="max-w-[180px] truncate">{comment.productID?.name || "—"}</td>
                                    <td><Stars score={comment.score} className="text-xs" /></td>
                                    <td className="tabular-nums">{comment.date?.slice(0, 10)}</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className={`badge ${comment.isAccept ? "badge-success" : "badge-warning"}`}>
                                                {comment.isAccept ? "Approved" : "Pending"}
                                            </span>
                                            {comment.answer && <span className="badge badge-neutral">Answered</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-1.5">
                                            <button type="button" title="View" className="btn btn-ghost btn-sm" onClick={() => showContent(comment.body)}>
                                                <LuEye className="size-4" />
                                            </button>
                                            <button type="button" title="Edit" className="btn btn-ghost btn-sm" onClick={() => editComment(comment._id, comment.body)}>
                                                <LuPencil className="size-4" />
                                            </button>
                                            <button type="button" className={`btn btn-sm ${comment.isAccept ? "btn-soft-danger" : "btn-soft-primary"}`}
                                                onClick={() => acceptMutate({ id: `${comment._id}/accept` })}>
                                                {comment.isAccept ? <><LuX className="size-3.5" /> Reject</> : <><LuCheck className="size-3.5" /> Accept</>}
                                            </button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => answerComment(comment._id)}>
                                                <LuReply className="size-3.5" /> {comment.answer ? "Answered" : "Answer"}
                                            </button>
                                            <button type="button" title="Ban user" className="btn btn-soft-danger btn-sm" onClick={() => banUser(comment.email, comment.username)}>
                                                <LuBan className="size-3.5" />
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
