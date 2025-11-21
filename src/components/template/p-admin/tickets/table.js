"use client"
import React from "react";
import styles from "./table.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import swal from "sweetalert";
import { manageError } from "@/utils/helper";
export default function DataTable({ tickets, title }) {
    const router = useRouter()

    const banUser = async (userID, email) => {
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
                                        onClick={() => banUser(item.userID)}
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
