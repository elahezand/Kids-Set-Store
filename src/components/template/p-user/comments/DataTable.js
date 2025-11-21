"use client";
import React, { useState } from "react";
import styles from "./DataTable.module.css";
import { FaRegStar, FaStar } from "react-icons/fa";
import showSwal from "@/utils/helper";
export default function DataTable({ comments, title }) {
    const showCommentBody = (commentBody) => {
        showSwal(commentBody, undefined, "ok");
    };

    return (
        <div>
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
                            <th>Date</th>
                            <th>Product</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Content</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map((comment, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{(comment.date).slice(0, 10)}</td>
                                <td>{comment.productID.name}</td>
                                <td>
                                    {new Array(comment.score).fill(0).map((item, index) => (
                                        <FaStar key={index} />
                                    ))}
                                    {new Array(5 - comment.score).fill(0).map((item, index) => (
                                        <FaRegStar key={index} />
                                    ))}
                                </td>
                                <td>
                                    <button type="button" className={comment.isAccept ? styles.check : styles.no_check}>
                                        {comment.isAccept ? "Approved" : "Pending...  "}
                                    </button>
                                </td>
                                <td>

                                    <button
                                        type="button"
                                        onClick={() => showCommentBody(comment.body)}
                                        className={styles.btn}>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
