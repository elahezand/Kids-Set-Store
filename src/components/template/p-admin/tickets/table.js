"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuBan, LuEye, LuTicket } from "react-icons/lu";
import { usePost } from "@/utils/hooks/useReactQueryPanel";
import EmptyState from "@/components/modules/ui/emptyState";

const priorities = {
    1: { label: "Low", className: "badge-neutral" },
    2: { label: "Medium", className: "badge-warning" },
    3: { label: "High", className: "badge-danger" },
};

export default function TicketsTable({ tickets = [], total }) {
    const router = useRouter();

    const { mutate: banUser } = usePost("/users/ban", {
        onSuccess: () => {
            toast.success("User banned successfully");
            router.refresh();
        },
    });

    const banHandler = (user) =>
        swal({ title: "Ban this user?", icon: "warning", buttons: ["Cancel", "Ban"], dangerMode: true })
            .then((ok) => ok && banUser({ email: user?.email, username: user?.username }));

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Tickets list</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} tickets</span>}
            </div>

            {tickets.length === 0 ? (
                <EmptyState title="No tickets yet" icon={LuTicket} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>User</th>
                                <th>Department</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((item) => {
                                const priority = priorities[item.priority] || { label: item.priority, className: "badge-neutral" };
                                return (
                                    <tr key={item._id}>
                                        <td className="max-w-[240px] truncate font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                                        <td>{item.user?.username || item.user?.email || "—"}</td>
                                        <td>{item.department?.title || "—"}</td>
                                        <td><span className={`badge ${priority.className}`}>{priority.label}</span></td>
                                        <td>
                                            <span className={`badge ${item.isAnswer ? "badge-success" : "badge-accent"}`}>
                                                {item.isAnswer ? "Answered" : "Open"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/p-admin/tickets/${item._id}`} className="btn btn-secondary btn-sm">
                                                    <LuEye className="size-3.5" /> View
                                                </Link>
                                                <button type="button" title="Ban user" onClick={() => banHandler(item.user)} className="btn btn-soft-danger btn-sm">
                                                    <LuBan className="size-3.5" />
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
