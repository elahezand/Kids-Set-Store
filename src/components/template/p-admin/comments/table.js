"use client";
import React from "react";
import styles from "./commentTable.module.css";
import { useRouter } from "next/navigation";
import showSwal, { manageError } from "@/utils/helper";
import swal from "sweetalert";
export default function DataTable({ comments, title }) {
    const router = useRouter();
    const showCommentBody = (body) => {
        showSwal(body, undefined, "Read It :)");
    };

    const acceptComment = async (commentID) => {
        swal({
            title: "are you Sure To Change Status? :)",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/comments/accept`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            commentID
                        })
                    })
                    if (res.status !== 200) return manageError(res.status)

                    swal({
                        title: "Status Changed Successfully :)",
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

    const answerComment = async (commentID) => {
        swal({
            title: "Inter Your Answer :)",
            content: "input",
            buttons: "submit"
        }).then(async result => {
            if (result) {
                try {
                    const res = await fetch(`/api/comments/answer`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            answer: result,
                            commentID
                        })
                    })

                    if (res.status !== 200) return manageError(res.status)

                    swal({
                        title: "Comment Answerred Successfully :)",
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

    const editComment = async (commentID, content) => {
        swal({
            title: "Change Content :)",
            content: {
                element: "input",
                attributes: {
                    value: content
                }
            },
            buttons: "submit"
        }).then(async (result) => {
            if (result) {
                try {
                    const res = await fetch(`/api/comments/${commentID}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            content: result,
                        })
                    })
                    if (res.status !== 200) return manageError(res.status)

                    swal({
                        title: "Comment Updated Successfully :)",
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
                            <th>User</th>
                            <th>Email</th>
                            <th>Score</th>
                            <th>product</th>
                            <th>createdAt</th>
                            <th>show</th>
                            <th>Edit</th>
                            <th>Accept / Reject</th>
                            <th>Answer</th>
                            <th>Ban</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map((comment, index) => (
                            <tr key={comment._id}>
                                <td
                                    className={comment.answer ?
                                        `${styles.answer}` :
                                        `${styles.no_answer}`}>{index + 1}</td>
                                <td>{comment.username}</td>
                                <td>{comment.email}</td>
                                <td>{comment.score}</td>
                                <td>{comment.productID.name}</td>
                                <td>{comment.date.slice(0, 10)}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="edit_btn"
                                        onClick={() => showCommentBody(comment.body)}
                                    >
                                        Content
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() => editComment(comment._id, comment.body)}
                                        className="edit_btn">
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() =>
                                            acceptComment(comment._id)}
                                        className={comment.isAccept ?
                                            "delete_btn" :
                                            "edit_btn"}>
                                        {comment.isAccept ? "Reject" : "Accept"}
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() =>
                                            answerComment(comment._id)}
                                        className={comment.answer ?
                                            "edit_btn" :
                                            "delete_btn"}>
                                        {comment.answer ? "Answered" : "Answer"}
                                    </button>
                                </td>
                                <td>
                                    <button type="button"
                                        onClick={() =>
                                            banUser(comment.userID, comment.email)}
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
