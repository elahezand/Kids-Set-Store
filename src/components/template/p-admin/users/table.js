"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import toast from "react-hot-toast";
import { LuBan, LuPencil, LuShieldCheck, LuTrash2, LuUsers } from "react-icons/lu";
import { useDelete, usePut, usePost } from "@/utils/hooks/useReactQuery";
import EmptyState from "@/components/modules/ui/emptyState";
import EditUserModal from "./editUserModal";

export default function UsersTable({ users = [], total }) {
    const router = useRouter();
    const [editing, setEditing] = useState(null);

    const refresh = (message) => () => {
        toast.success(message);
        router.refresh();
    };

    const { mutate: deleteUser } = useDelete("/users", { onSuccess: refresh("User removed successfully") });
    const { mutate: changeRole } = usePut("/users/role", { onSuccess: refresh("Role changed successfully") });
    const { mutate: banUser } = usePost("/users/ban", { onSuccess: refresh("User banned successfully") });

    const confirm = (title, button, action) =>
        swal({ title, icon: "warning", buttons: ["Cancel", button], dangerMode: true }).then((ok) => ok && action());

    return (
        <section className="card overflow-hidden">
            <div className="card-header">
                <h2 className="card-title">Users list</h2>
                {typeof total === "number" && <span className="badge badge-neutral">{total} users</span>}
            </div>

            {users.length === 0 ? (
                <EmptyState title="No users yet" icon={LuUsers} />
            ) : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-9 items-center justify-center rounded-full bg-sage-50 text-sm font-semibold text-sage-700 uppercase dark:bg-sage-500/10 dark:text-sage-300">
                                                {user.username?.[0] || "?"}
                                            </span>
                                            <div className="leading-tight">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                                                <p className="text-xs text-gray-700 dark:text-gray-500">{user.email || "No email"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="tabular-nums">{user.phone || "—"}</td>
                                    <td>
                                        <span className={`badge ${user.role === "ADMIN" ? "badge-success" : "badge-neutral"}`}>
                                            {user.role === "ADMIN" ? "Admin" : "User"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(user)}>
                                                <LuPencil className="size-3.5" /> Edit
                                            </button>
                                            <button type="button" className="btn btn-soft-primary btn-sm" onClick={() => changeRole({ id: user._id, payload: {} })}>
                                                <LuShieldCheck className="size-3.5" /> {user.role === "ADMIN" ? "Make user" : "Make admin"}
                                            </button>
                                            <button type="button" className="btn btn-soft-danger btn-sm" title="Ban"
                                                onClick={() => confirm("Ban this user?", "Ban", () => banUser({ user: user._id, email: user.email, phone: user.phone }))}>
                                                <LuBan className="size-3.5" />
                                            </button>
                                            <button type="button" className="btn btn-soft-danger btn-sm" title="Remove"
                                                onClick={() => confirm("Remove this user?", "Remove", () => deleteUser(user._id))}>
                                                <LuTrash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && <EditUserModal data={editing} hideModal={() => setEditing(null)} />}
        </section>
    );
}
