"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import EditModal from "@/components/modules/modals/editModal";
import { manageError } from "@/utils/helper";
export default function DataTable({ users, title }) {
    const router = useRouter()
    const [user, setUser] = useState("")

    const [showModalEdit, setShowModalEdit] = useState(false)
    const hideModal = () => setShowModalEdit(false)


    const changeRole = async (userID) => {
        try {
            const res = await fetch("/api/users/role", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userID,
                })
            })

            if (res.status !== 200) return manageError(res.status)
            swal({
                title: "Role Was Changed Successfully :)",
                icon: "success",
                buttons: "ok"
            }).then(result => {
                if (result) {
                    router.refresh()
                }
            })
        } catch (err) {
            swal({
                title: "NetWork Error",
                icon: "warning",
                buttons: "ok"
            })
        }

    }

    const removeUser = async (userID) => {
        swal({
            title: "are you Sure To Remove This user? :)",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/users/${userID}`, {
                        method: "DELETE",
                    })
                    if (res.status !== 200) return manageError(res.status)
                    swal({
                        title: "User Removed Successfully :)",
                        icon: "success",
                        buttons: "ok"
                    }).then(result => {
                        if (result) {
                            router.refresh()
                        }
                    })

                }
                catch (err) {
                    swal({
                        title: "NetWork Error",
                        icon: "warning",
                        buttons: "ok"
                    })
                }
            }
        })

    }

    const banUser = async (userID, phone, email) => {
        swal({
            title: "are you Sure To Ban This user ? :)",
            icon: "watning",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/users/ban`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user: userID,
                            phone,
                            email
                        })
                    })
                    if (res.status !== 200) return manageError(res.status)
                    swal({
                        title: "User Banned Successfully :)",
                        icon: "success",
                        buttons: "ok"
                    }).then(result => {
                        if (result) {
                            router.refresh()
                        }
                    })

                } catch (err) {
                    swal({
                        title: "NetWork Error",
                        icon: "warning",
                        buttons: "ok"
                    })
                }
            }
        })

    }

    return (
        <>
            <div>
                <h1 className="title">
                    <span>{title}</span>
                </h1>
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
                            <th>Access Level</th>
                            <th>Remove</th>
                            <th>Ban</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id}>
                                <td>{index + 1}</td>
                                <td>{user.username}</td>
                                <td>{user.email ? user.email : "No Email Found"}</td>
                                <td>{user.role === "USER" ? "USER" : "ADMIN"}</td>
                                <td>
                                    <button type="button"
                                        onClick={() => {
                                            setUser(user)
                                            setShowModalEdit(true)
                                        }}
                                        className="edit_btn">
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() => changeRole(user._id)}
                                        className="edit_btn">
                                        Change Role
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() => removeUser(user._id)}
                                        className="delete_btn">
                                        Remove
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() =>
                                            banUser(user._id, user.phone, user.email)}
                                        className="delete_btn">
                                        Ban
                                    </button>
                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>
                {showModalEdit &&
                    <EditModal
                        showEditModal={setShowModalEdit}
                        hideModal={hideModal}
                        data={user} />
                }
            </div>
        </>
    );
}
