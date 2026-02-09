"use client"
import React from "react";
import styles from "./table.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { usePost } from "@/utils/hooks/useReactQueryPanel";
import swal from "sweetalert";
export default function DataTable({ tickets, title }) {
    const router = useRouter()

    const { mutate: banUserMutate } = usePost(`/users/ban`, {
        onSuccess: () => {
            toast.success("User Banned Successfully :)");
            router.refresh();
        },
    });
    const banHandler = (userID, phone, email) => {
        swal({
            title: "Are you sure to ban this user?",
            icon: "warning",
            buttons: ["No", "Yes"]
        }).then(result => {
            if (result) banUserMutate({ user: userID, phone, email });
        });
    };


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
                            <th>Subject</th>
                            <th>Department</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Content</th>
                            <th>Ban</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((item, index) => (
                            <tr key={index + 1} >
                                <td
                                    className={item.answerBy === `USER` ?
                                        `${styles.no_answer}` : `${styles.answer}`}
                                >{index + 1}</td>
                                <td>{item.subject}</td>
                                <td>{item.department.title}</td>
                                <td>{item.priority}</td>
                                <td>{item.status}</td>
                                <td>
                                    <Link href={`tickets/${item._id}`}
                                        type="button"
                                        className="edit_btn">
                                        Show
                                    </Link>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() => banHandler(item.userID)}
                                        className="delete_btn">
                                        Ban
                                    </button>
                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
