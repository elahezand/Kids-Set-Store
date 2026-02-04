"use client";
import React, { useState } from "react";
import { usePost, usePut } from "@/utils/hooks/useReactQueryPanel";
import styles from "./commentTable.module.css";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import { input } from "@heroui/react";
export default function DataTable({ comments, title }) {
    const router = useRouter()

    const { mutate: answerMutate } = usePost("/comments/answer", {
        onSuccess: () => {
            toast.success("your answer sended Successfully :)")
            router.refresh()
        },
    })

    const { mutate: acceptMutate } = usePut("/comments", {
        onSuccess: () => {
            toast.success("Successfull :)")
            router.refresh()
        },
    })
    const { mutate: editmutate } = usePut(`/comments`, {
        onSuccess: () => {
            toast.success("Successfull :)")
            router.refresh()
        },
    })

    const { mutate: banmutate } = usePost("/users/ban", {
        onSuccess: () => {
            toast.success("this user Banned Successfully :)")
            router.refresh()

        },
    })

    const showContent = async (content) => {
        swal({
            title: content,
            buttons: "ok"
        })
    }

    const answerComment = async (Id) => {
        swal({
            title: "Please Send Your Answer",
            content: "input",
            buttons: "submit"
        }).then(result => {
            if (result) {
                answerMutate({
                    answer: result,
                    commentID: Id
                })
            }
        })
    }

    const acceptComment = (commentID) => {
        acceptMutate({ id: `${commentID}/accept` })
    }

    const banUser = async (email, username) => {
        swal({
            title: "Are You Sure To remove This item?",
            icon: "warning",
            buttons: ["No", "yes"]
        }).then(result => {
            if (result) {
                banmutate({ email, username })
            }
        })
    }

    const editComment = async (commentId, content) => {
        swal({
            title: "Edit Comment",
            text: "Current: " + content,
            content: "input",
            buttons: ["Cancel", "Submit"]
        }).then(result => {
            if (result) {
                editmutate({
                    id: commentId,
                    body: result
                })
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
                                <td>{comment.productID?.name}</td>
                                <td>{comment.date.slice(0, 10)}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="edit_btn"
                                        onClick={() => showContent(comment.body)}
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
