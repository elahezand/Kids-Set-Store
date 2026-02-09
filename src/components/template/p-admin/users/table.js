"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import EditModal from "@/components/modules/modals/editModal";
import { useDelete, usePut, usePost } from "@/utils/hooks/useReactQueryPanel";
import toast from "react-hot-toast";
import { log } from "three";

export default function DataTable({ users, title }) {
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const hideModal = () => setShowModalEdit(false);

    const { mutate: deleteUserMutate } = useDelete(`/users`, {
        onSuccess: () => {
            toast.success("User Removed Successfully :)");
            router.refresh();
        },
    });

    const { mutate: changeRoleMutate } = usePut(`/users/role`, {
        onSuccess: () => {
            toast.success("Role Changed Successfully :)");
            router.refresh();
        },
    });

    const { mutate: banUserMutate } = usePost(`/users/ban`, {
        onSuccess: () => {
            toast.success("User Banned Successfully :)");
            router.refresh();
        },
    });

    const removeHandler = (id) => {
        swal({
            title: "Are you sure to remove this user?",
            icon: "warning",
            buttons: ["No", "Yes"]
        }).then(result => {
            if (result) deleteUserMutate(id);
        });
    };

    const changeRoleHandler = (id) => {
        if (!id) return toast.error("User ID not found!");
      changeRoleMutate({ 
        id: id, 
        payload: {}
    });
    };
    const banHandler = (userID, email) => {
        swal({
            title: "Are you sure to ban this user?",
            icon: "warning",
            buttons: ["No", "Yes"]
        }).then(result => {
            if (result) banUserMutate({ user: userID, email });
        });
    };

    return (
        <>
            <div>
                <h1 className="title"><span>{title}</span></h1>
            </div>
            <div className="table_container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Edit</th>
                            <th>Change Role</th>
                            <th>Remove</th>
                            <th>Ban</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td>{user.username}</td>
                                <td>{user.email || "No Email Found"}</td>
                                <td>{user.role === "ADMIN" ? "Admin" : "User"}</td>
                                <td>
                                    <button className="edit_btn" onClick={() => {
                                        setUser(user);
                                        setShowModalEdit(true);
                                    }}>Edit</button>
                                </td>
                                <td>
                                    <button className="edit_btn" onClick={() => changeRoleHandler(user._id)}>
                                        Change Role
                                    </button>
                                </td>
                                <td>
                                    <button className="delete_btn" onClick={() => removeHandler(user._id)}>
                                        Remove
                                    </button>
                                </td>
                                <td>
                                    <button className="delete_btn" onClick={() => banHandler(user._id, user.phone, user.email)}>
                                        Ban
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showModalEdit && (
                    <EditModal
                        showEditModal={setShowModalEdit}
                        hideModal={hideModal}
                        data={user}
                    />
                )}
            </div>
        </>
    );
}